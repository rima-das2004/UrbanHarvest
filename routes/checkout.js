const express=require("express");
const app=express();
const User=require("../models/users.js")
const Product=require("../models/productSchema.js");
const Cart=require("../models/cartSchema.js");
const router=express.Router({mergeParams:true});
app.use(express.urlencoded({extended:true}));
const ExpressError=require("../utils/ExpressError.js")
const asyncWrap=require("../utils/AsyncWrap.js")
const {isLoggedIn, saveRedirectUrl, guestModeCart,setData}=require("../middleware.js")
const multer  = require('multer')
const {cloudinary,storage}=require("../cloudConfig.js")
 const parser = multer({ storage: storage });
const methodOverride=require("method-override");
require('dotenv').config();


router.get("/checkout",isLoggedIn,(asyncWrap(async(req,res)=>{
    let redirectUrl=res.locals.redirectUrl;
    let user=await User.findById(req.user)
        // Retrieve cart from session
        console.log(req.user)
        console.log("current cart",req.cart._id)
        let cartUser=await Cart.find({user:req.user._id});
       // console.log("current user cart",cartUser)
        const cartProduct = req.session.setCart || [];

        if (cartProduct.length > 0 ) {
            
            console.log("Cart retrieved in checkout:", cartProduct);
            const cartItems = cartProduct.map(item => ({
                Details: item.Details._id,  // Extract the ID from Details
                ChoosenQuantity: item.ChoosenQuantity
            }));
            console.log(cartItems)
            if(!req.body.user){
        
                if(req.user){

                    // let cart =await Cart.findByIdAndUpdate({_id:req.cart._id},{         
                    //     $push: { product:{ $each:cartItems}}});
                    // await cart.save();
                    for (const item of cartItems) {
                    await Cart.findOneAndUpdate(
                        {
                            _id: req.cart._id,
                            "product.Details": item.Details  // Check if product exists
                        },
                        {
                            $inc: { "product.$.ChoosenQuantity": item.ChoosenQuantity }  // Increase quantity
                        },).then( (result) => {
                            if (!result) {
                                // If product doesn't exist, add it
                                Cart.findByIdAndUpdate(
                                    req.cart._id,
                                    {
                                        $push: { 
                                            product: {
                                                Details: item.Details,
                                                ChoosenQuantity: item.ChoosenQuantity
                                            }
                                        }
                                    },)}})}
                            
                        let Newcart=await Cart.findById(req.cart._id).populate("product.Details");
                        req.cart=Newcart
                        res.locals.cart=req.cart
                    //console.log(cart); 
                    res.render("all/checkPay.ejs",{cartProduct:Newcart.product,mapApiKey:process.env.MAP_API}) 
                }
                
            }
            else{
                console.log("done1")
                res.redirect("/product");
                
            }
        }
        else if(req.user && cartUser){
            if(cartUser[0].product.length>0){
                
                res.render("all/checkPay.ejs",{product:cartUser.product,user:user,mapApiKey:process.env.MAP_API})
            }
            else{
                req.flash("error","You must select product to checkout")
                res.redirect("/product")
            }

        }
        else {
            console.log("done2")
            console.log(" No cart found in session");
            res.redirect("/product")
            
        }
 
    console.log("set prev",cartProduct)
    

})))

module.exports=router