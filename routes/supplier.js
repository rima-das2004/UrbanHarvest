const express=require("express");
const app=express();
const router=express.Router({mergeParams:true});
app.use(express.urlencoded({extended:true}));
const {isLoggedIn, saveRedirectUrl}=require("../middleware.js")
const multer  = require('multer')
const {cloudinary,storage}=require("../cloudConfig.js")
 const parser = multer({ storage: storage });
 const ExpressError=require("../utils/ExpressError.js")
 const asyncWrap=require("../utils/AsyncWrap.js")
 const User=require("../models/users.js")
 const Product=require("../models/productSchema.js");
 const methodOverride=require("method-override");

router.get("/supplier",(req,res)=>{

   res.render("all/welcomeSupplier.ejs",{username:req.user.username});
})

 router.get("/supplier/:username",async(req,res)=>{
    //console.log(req.user)
  
    let supplier=await User.find({username:req.params.username})
    //console.log("supplier: ",supplier)
    let products=await Product.find({saler:supplier[0]._id})
    let catArr=[]
    console.log(products)
    for (let product of products){
     // console.log(product)
     let flag=false
      let c= product.category
     // console.log(c)
      for( let i of catArr){
         if(c==i){
            flag=true
         }
      }
      if(flag==false){
         catArr.push(c)
      }
      //console.log(catArr)
    }
    console.log("new",catArr)

    res.render("all/supplier.ejs",{username:supplier[0].username, categorySelection:catArr,products:products})
 })

 router.get("/supplier/:username/addProduct",isLoggedIn,async(req,res)=>{
   console.log(req.params.username)
   let supplier=await User.find({username:req.params.username})
   supplier=supplier[0];
   res.render("all/supplierForm.ejs",supplier)
 })
 router.post("/supplier/:username/addProduct",parser.array("product[image]",4),isLoggedIn,asyncWrap(async (req,res)=>{
   let supplier=await User.find({username:req.params.username})
   supplier=supplier[0];
   let files=req.files
   let urls=files.map(merge)
   function merge(item){
      return {filename:item.filename,url:item.path}
   }
   let productStock=await new Product({
      name:req.body.product.name,
      category:req.body.product.category,
      info:req.body.product.info,
      price:req.body.product.price,
      quantity:req.body.product.quantity,
      unit:req.body.product.unit,
      saler:supplier._id,
      image:urls,
      actionAt:[Date.now()]
   })
  const productStore= await productStock.save()
   res.redirect(`/supplier/${supplier.username}`)

 }))

 router.put("/supplier/:username/updateStock/:productId",isLoggedIn,asyncWrap(async (req,res)=>{
   let {username,productId}=req.params;
   let {quantity,price}=req.body.product;
  
      let productUpdate=await Product.findByIdAndUpdate(productId,{quantity:quantity,price:price});
 

 if(price || quantity){
   let date=Date.now()
   productUpdate.actionAt.push(date)
 }
 await productUpdate.save()
   req.flash("success","Updated successfully!!")



 res.redirect(`/supplier/${username}`)

}))


router.delete("/supplier/:username/updateStock/:productId",isLoggedIn,asyncWrap(async(req,res)=>{
   let {username,productId}=req.params;
  
   let productUpdate=await Product.findByIdAndDelete(productId);
   if(productUpdate){
      req.flash("success","Deleted successfully!!")
   }
   else{
      req.flash("error","Deletion is not occured")
   }
   
   res.redirect(`/supplier/${username}`)
}))
 module.exports=router