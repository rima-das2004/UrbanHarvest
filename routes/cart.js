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
        
                            //await cartUpdate.save()
                            req.flash("success","already added");
                            res.redirect("/product/all");
                          
                        }
                        else{
                            cartUpdate.product.push({Details:prodId,quantity:quantity});
                            await cartUpdate.save()
                            req.flash("success","added succesfully");
                           res.redirect("/product/all");
                        }

                    }
                    else{
                        let cartUpdate=await Cart.findByIdAndUpdate(cart[0]._id,{});
                        cartUpdate.product.push({Details:prodId,quantity:quantity});
                            await cartUpdate.save()
                            req.flash("success",`Dear,${req.user.firstname}! Your cart is added succesfully`)
                           res.redirect("/product/all")
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
                req.flash("success","already added")
                res.redirect("/product/all")
            
        }
        else if(flag===false){
            let cartUpdate=await Cart.findByIdAndUpdate(
                req.cart._id,{})
            console.log(cartUpdate,prodId)
            cartUpdate.product.push({Details:prodId,quantity:quantity});
            await cartUpdate.save()
            req.flash("success","added successfully")
            res.redirect("/product/all")
        }
        
            }
            
        else{
         
            let cartUpdate=await Cart.findByIdAndUpdate(
                req.cart._id,{})
            console.log(cartUpdate,prodId)
            cartUpdate.product.push({Details:prodId,quantity:quantity});
            await cartUpdate.save()
            req.flash("success","added successfully")
            res.redirect("/product/all")
            
        }
    }

    }
   
})


// router.post("/checkout/:userId",isLoggedIn)
router.post("/cart/:id/delete/:prodId",guestModeCart, async (req, res) => {
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

        res.redirect("/product/all");
    } catch (error) {
        console.error(error);
        req.flash("error", "An error occurred while trying to delete the product.");
        res.redirect("/product/all");
    }
});


 module.exports=router
