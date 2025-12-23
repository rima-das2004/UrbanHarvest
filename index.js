if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const port = 8080;

const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");

const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const cookieParser = require("cookie-parser");

const passport = require("passport");
const LocalStrategy = require("passport-local");

const User = require("./models/users.js");
const Cart = require("./models/cartSchema.js");

const { guestModeCart } = require("./middleware.js");
const ExpressError = require("./utils/ExpressError.js");

// Routes
const userRoute = require("./routes/user.js");
const supplierRoute = require("./routes/supplier.js");
const productRoute = require("./routes/product.js");
const cartRoute = require("./routes/cart.js");
const checkoutRoute = require("./routes/checkout.js");

// ---------- BASIC APP CONFIG ----------
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

const DB_URL = process.env.ATLAS_URL;
const SECRET = process.env.SECRET;

if (!DB_URL || !SECRET) {
  throw new Error("Missing ATLAS_URL or SECRET");
}

mongoose.set("bufferCommands", false);

// ---------- START SERVER ----------
async function startServer() {
  try {
    // 1. DB CONNECT
    await mongoose.connect(DB_URL);
    console.log("MongoDB connected");

    // 2. SESSION STORE
    const store = MongoStore.create({
      mongoUrl: DB_URL,
      collectionName: "sessions",
      crypto: { secret: SECRET },
    });

    store.on("error", (e) => {
      console.log("SESSION STORE ERROR", e);
    });

    const sessionConfig = {
      store,
      name: "session",
      secret: SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      },
    };

    // 3. SESSION + FLASH
    app.use(cookieParser());
    app.use(session(sessionConfig));
    app.use(flash());

    // 4. PASSPORT
    app.use(passport.initialize());
    app.use(passport.session());

    passport.use(new LocalStrategy(User.authenticate()));
    passport.serializeUser(User.serializeUser());
    passport.deserializeUser(User.deserializeUser());

    // 5. CUSTOM MIDDLEWARES
    app.use(guestModeCart);

    app.use(async (req, res, next) => {
      res.locals.success = req.flash("success");
      res.locals.errMsg = req.flash("error");
      res.locals.currentUser = req.user;

      if (req.cart) {
        const cart = await Cart.findById(req.cart._id).populate(
          "product.Details"
        );
        req.cart = cart;
        res.locals.cart = cart;
      }
      next();
    });

    // 6. ROUTES
    app.use("/", productRoute);
    app.use("/", userRoute);
    app.use("/", supplierRoute);
    app.use("/", cartRoute);
    app.use("/", checkoutRoute);

    // 7. ERROR HANDLING
    app.all("*", (req, res, next) => {
      next(new ExpressError(404, "Page Not Found"));
    });

    app.use((err, req, res, next) => {
      const { status = 500, message = "Something went wrong" } = err;
      res.status(status).render("errorModel/404-error.ejs", { message, status });
    });

    // 8. START LISTENING (LAST)
    app.listen(port, () => {
      console.log("Server running on port", port);
    });

  } catch (err) {
    console.error("Startup failed:", err);
    process.exit(1);
  }
}

startServer();
