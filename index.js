if(process.env.NODE_ENV != "production"){
  require('dotenv').config()
}

const express=require("express");
const app=express();
const port=8080
const mongoose=require("mongoose");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
app.set("view engine","ejs");
const path=require("path")
app.set("views",path.join(__dirname,"views"));
const engine=require("ejs-mate");
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",engine);
app.use(express.static(path.join(__dirname,"/public")));
const session=require("express-session");
const flash=require("connect-flash")
const passport=require("passport");
const passportLocal=require("passport-local");
const passportLocalMongoose=require("passport-local-mongoose");
const userRoute=require("./routes/user.js");
const supplierRoute=require("./routes/supplier.js");
const productRoute=require("./routes/product.js");
const cartRoute=require("./routes/cart.js");
const checkoutRoute=require("./routes/checkout.js");
const User=require("./models/users.js")
const Cart=require("./models/cartSchema.js")
const Product=require("./models/productSchema.js")
const {guestModeCart}=require("./middleware.js")
const cookieParser = require('cookie-parser');
const mongoStore=require("connect-mongo")
//---------------------> cloudinary storage

const ExpressError=require("./utils/ExpressError.js")
const asyncWarp=require("./utils/AsyncWrap.js")
const DbUrl=process.env.ATLAS_URL

// main().then(()=>{
//     console.log("Connected to DB");
// })
// .catch((err)=>{
//     console.log(err)
// })
// async function main() {
//     await mongoose.connect(DbUrl);
//     // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
//   }
// const store=mongoStore.create({

//   mongoUrl:DbUrl,
//   crypto:{
//     secret:process.env.SECRET
//   },
//   touchAfter:24*3600
// });
// store.on("error",()=>{
//   console.log("ERROR IN MINGI STORE SESSION")
// })
// const sessionOpt={
//   store,
//     secret:process.env.SECRET,
//     resave:false,
//     saveUninitialized:true,
//     cookie:{
//       expires:Date.now()+7*24*60*60*1000,
//       httpOnly:true,
//       maxAge:7*24*60*60*1000
//     }
//   }

// app.listen(port,()=>{
//     console.log("app is listening at port of ",port)
// })

// async function main() {
//     await mongoose.connect('mongodb://127.0.0.1:27017/UrbanHarvest');
//     // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
//   }
// main().then(()=>{
//     console.log("Connected to DB");
// })
// .catch((err)=>{
//     console.log(err)
// })
//const DbUrl = process.env.ATLAS_URL;

if (!DbUrl || !process.env.SECRET) {
  throw new Error("ATLAS_URL or SECRET is missing");
}

mongoose.set("bufferCommands", false);

async function startServer() {
  try {
    await mongoose.connect(DbUrl);
    console.log("Connected to DB");

    const store = mongoStore.create({
      mongoUrl: DbUrl,
      collectionName: "sessions",
      crypto: {
        secret: process.env.SECRET,
      },
    });

    const sessionOpt = {
      store,
      secret: process.env.SECRET,
      resave: false,
      saveUninitialized: true,
      cookie: {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      },
    };

    // ✅ MIDDLEWARES THAT DEPEND ON SESSION
    app.use(cookieParser());
    app.use(session(sessionOpt));
    app.use(flash());

    app.use(passport.initialize());
    app.use(passport.session())


    passport.use(new passportLocal(User.authenticate()));
    passport.serializeUser(User.serializeUser());
    passport.deserializeUser(User.deserializeUser());
    app.use(guestModeCart);
    
      app.listen(port, () => {
      console.log("app is listening at port", port);
    });

  } catch (err) {
    console.error("Startup failed:", err);
    process.exit(1);
  }
}


startServer();


app.use(express.json()); 
app.use(express.urlencoded({ extended: true }))
//passport



app.use(async(req,res,next)=>{
  res.locals.success=req.flash("success");
  res.locals.errMsg=req.flash("error");

  res.locals.currentUser=req.user;
  if(req.cart){
    //console.log(req.cart)
    let cart=await Cart.findById(req.cart._id).populate("product.Details");
    req.cart=cart
    res.locals.cart=req.cart
    //console.log(res.locals.cart)
  }

  if(req.user){
    console.log(req.user)
  }

  next()
})


app.use("/",productRoute);
app.use("/",userRoute);
app.use("/",supplierRoute);
app.use("/",cartRoute);
app.use("/",checkoutRoute);



app.all("*",(req,res,next)=>{
  throw new ExpressError(404,"page not found");

})

app.use((err,req,res,next)=>{
  let{status=500,message="something went wrong"}=err;
  res.status(status).render("errorModel/404-error.ejs",{message:message,status:status})
})
