const express=require("express");
const app=express();
const User=require("../models/users.js")
const Cart=require("../models/cartSchema.js")
const Product=require("../models/productSchema.js")
const ExpressError=require("../utils/ExpressError.js")
const asyncWrap=require("../utils/AsyncWrap.js")
const methodOverride=require("method-override");
const productSchema = require("../models/productSchema.js");
const { isLoggedIn,saveRedirectUrl,guestModeCart } = require("../middleware.js");
const router=express.Router({mergeParams:true});
app.use(express.urlencoded({extended:true}));


router.post("/cart/:prodId/add",guestModeCart,saveRedirectUrl,async(req,res)=>{
    let redirectUrl=res.locals.urlSave
    let {prodId}=req.params;
    console.log(prodId)
    let {quantity=1,totalPrice}=req.body;
    console.log("add",req.user)
   
        if(req.user){
        let user=await User.findById(req.user._id);
        if(user){
          
            let cart= await Cart.find({user:user._id});
            console.log("f",cart)
            
            if(cart)
                {
                    
                    if(cart[0].product.length>0){
                        console.log(cart[0].product.length)
                        console.log("huh")
                        let flag=false
                        for (let p of cart[0].product){
                            if(p.Details.equals(prodId)){
                                flag=true;
                            }
                        }
                        let cartUpdate=await Cart.findByIdAndUpdate(cart[0]._id,{});
                        if(flag==true){
                            await Cart.findOneAndUpdate(
                                {
                                    _id: req.cart._id,
                                    "product.Details": prodId  // Check if product exists
                                },
                                {
                                    $inc: { "product.$.ChoosenQuantity": 1 }  // Increase quantity
                                },)
                            //await cartUpdate.save()
                            req.flash("success","quantity increased");
                            if(redirectUrl){
                                res.redirect(redirectUrl)
                            }
                            else{
                                res.redirect("/product/all");
                            }
                          
                          
                        }
                        else{
                            cartUpdate.product.push({Details:prodId,quantity:quantity});
                            await cartUpdate.save()
                            req.flash("success","added succesfully");
                            if(redirectUrl){
                                res.redirect(redirectUrl)
                            }
                            else{
                                res.redirect("/product/all");
                            }
                        }

                    }
                    else{
                        let cartUpdate=await Cart.findByIdAndUpdate(cart[0]._id,{});
                        cartUpdate.product.push({Details:prodId,quantity:quantity});
                            await cartUpdate.save()
                            req.flash("success",`Dear,${req.user.firstname}! Your cart is added succesfully`)
                            if(redirectUrl){
                                res.redirect(redirectUrl)
                            }
                            else{
                                res.redirect("/product/all");
                            }
                    }
                

              
            }
            // else{
            //     let cart=new Cart({
            //         user:req.user._id,
            //         sessionId:null,
            //         status:"active",
            //         product:{
            //             Details:prodId,
            //             quantity:quantity,
                       
            //         }
            //     })
            //     await cart.save()
            //     req.flash("success",`Dear,${req.user.firstname}! Your cart is added succesfully`)
            //    res.redirect("/product/all")
            // }
        }
    }
    else{
        let cart= await Cart.find({sessionId:req.cookies.sessionId});
        console.log(cart[0].product.length)
        if(cart){
            if(cart[0].product.length>0){
                let flag=false
            for (let p of cart[0].product){
                if(p.Details.equals(prodId)){
                    console.log("ay")
                    flag=true;
                    //req.flash("success","already added")
                }
            }
         
            if(flag===true){
                console.log("in true",flag)
                
                await Cart.findOneAndUpdate(
                                        {
                                            _id: req.cart._id,
                                            "product.Details": prodId  // Check if product exists
                                        },
                                        {
                                            $inc: { "product.$.ChoosenQuantity": 1 }  // Increase quantity
                                        },)
                    // console.log(cartUpdate);
                    // for (let productDetails of cartUpdate.product){
                    //     if(productDetails.Details==prodId){
                    //       let count=productDetails.ChoosenQuantity
                    //         productDetails.ChoosenQuantity=count+1
                    //         console.log("done")
                    //     }
                    // }
                    console.log("done")
                   
                req.flash("success","quantity increased");
                
                if(redirectUrl){
                    res.redirect(redirectUrl)
                }
                else{
                    res.redirect("/product/all");
                }
            
        }
        else if(flag===false){
            let cartUpdate=await Cart.findByIdAndUpdate(
                req.cart._id,{})
            console.log(cartUpdate,prodId)
            cartUpdate.product.push({Details:prodId,quantity:quantity});
            await cartUpdate.save()
            req.flash("success","added successfully")
            if(redirectUrl){
                res.redirect(redirectUrl)
            }
            else{
                res.redirect("/product/all");
            }
        }
        
            }
            
        else{
         
            let cartUpdate=await Cart.findByIdAndUpdate(
                req.cart._id,{})
            console.log(cartUpdate,prodId)
            cartUpdate.product.push({Details:prodId,quantity:quantity});
            await cartUpdate.save()
            req.flash("success","added successfully")
            if(redirectUrl){
                res.redirect(redirectUrl)
            }
            else{
                res.redirect("/product/all");
            }
            
        }
    }

    }
   
})

router.post("/cart/:prodId/increase/:cartId",saveRedirectUrl,async (req,res)=>{
    let redirectUrl=res.locals.urlSave
    let{prodId,cartId}=req.params
    console.log("inc---",prodId,cartId)
    let increment=await Cart.findOneAndUpdate(
        {
            _id: cartId,
            "product.Details": prodId  // Check if product exists
        },
        {
            $inc: { "product.$.ChoosenQuantity": 1 }  // Increase quantity
        },);
        
    if(redirectUrl){
        if(increment){
            console.log("increase")
            req.flash("Increased Quantity")
        }
        else{
            console.log(increment)
            req.flash("Can not be increased")
        }
        console.log(redirectUrl)
         res.redirect(redirectUrl)
    }
    else{
        if(increment){
            console.log("increase")
            req.flash("Increased Quantity")
        }
        else{
            console.log(increment)
            req.flash("Can not be increased")
        }
        res.redirect("/product")
    }

})
router.post("/cart/:prodId/decrease/:cartId",saveRedirectUrl,async (req,res)=>{
    let redirectUrl=res.locals.urlSave
    let{prodId,cartId}=req.params
    console.log("dec--",prodId,cartId)
    let decrement=await Cart.findOneAndUpdate(
        { _id: cartId },
        {
            $inc: { "product.$[item].ChoosenQuantity": -1 }
        },
        {
            arrayFilters: [{ "item.Details": prodId, "item.ChoosenQuantity": { $gt: 1 } }],
            new: true
        })
      
    if(redirectUrl){
        if(decrement){
            req.flash("Decreased Quantity")
        }
        else{
            req.flash("Can not be decreased")
        }
        console.log(redirectUrl)
         res.redirect(redirectUrl)
    }
    else{
        if(decrement){
            req.flash("Decreased Quantity")
        }
        else{
            req.flash("Can not be decreased")
        }
        res.redirect("/product")
    }
    
   

})
// router.post("/checkout/:userId",isLoggedIn)
router.post("/cart/:id/delete/:prodId",guestModeCart,saveRedirectUrl, async (req, res) => {
    let redirectUrl=res.locals.urlSave
    const { id, prodId } = req.params; // id can be userId or sessionId
    let {user,session}=req.query
    let cart=await Cart.find({});
    console.log("deleted")
    let count=0
    for(let c of cart){
        if(c.product.details!=prodId){
            count=count+1;
        }
        else{
            break;
        }
    }
    console.log("count",count)
    
    try {
        let query=`product[${count}].Details`
        // Check if the cart belongs to a user or is session-based
        if(session==="yes"){
            
            let cartUpdate = await Cart.updateOne({
                sessionId:id,
                
              },{$pull:{product:{Details:prodId}}}
             );
             //await cartUpdate.save()

             req.flash("success", "Product removed from cart successfully.");
        }
        if(user==="yes"){
            let cartUpdate = await Cart.findOneAndUpdate({
                user:id,
              },{$pull:{product:{Details:prodId}}}
             );
             await cartUpdate.save()
             req.flash("success", "Product removed from cart successfully.");
        }
     

        // if (cartUpdate) {
         
            
           
        // } else {
        //     req.flash("error", "Cart not found.");
        // }

        if(redirectUrl){
            res.redirect(redirectUrl)
        }
        else{
            res.redirect("/product/all");
        }
    } catch (error) {
        console.error(error);
        req.flash("error", "An error occurred while trying to delete the product.");
        if(redirectUrl){
            res.redirect(redirectUrl)
        }
        else{
            res.redirect("/product/all");
        }
    }
});


 module.exports=router
