let Cart=require("./models/cartSchema.js")
let Product=require("./models/productSchema.js")
const { v4: uuidv4 } = require('uuid');

module.exports.isLoggedIn=(req,res,next)=>{

    req.session.redirectUrl=req.originalUrl;
    if(!req.isAuthenticated()){
        req.flash("error","You must be logged in for accesing this website");
        return res.redirect("/role")
    }
    next();
}

module.exports.saveRedirectUrl=(req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl=req.session.redirectUrl;
    }

   next();
}

module.exports.guestModeCart=async(req,res,next)=>{
    let sessionId=req.cookies.sessionId;
    
    
    let cart = await Cart.findOne({ sessionId, status: 'active' });
    
        if (!sessionId) {
            sessionId = uuidv4();
            res.cookie('sessionId', sessionId, { maxAge: 24 * 60 * 60 * 1000, httpOnly: true });
        }
        
        if(!cart){
            let cart=new Cart({
                sessionId:sessionId,
                status:"active"
            })
            await cart.save();
        }
        req.cart=cart
    
    if(req.user){
        let cUser=await Cart.findOne({user:req.user._id,status:"active"})
        console.log("user in")
        if(!cUser){
            let cart=new Cart({
                user:req.user._id,
                status:"active",
                sessionId:null
            })
            await cart.save();
        }
        req.cart=cUser
    }
    
    
    if(req.cart){
        console.log(req.cart)
        let cartUser=await Cart.findById(req.cart._id).populate("product.Details")
        req.cart=cartUser
        res.locals.cart=req.cart
        console.log("lo",res.locals.cart.user);
        console.log(cartUser)
    }

    next()


}