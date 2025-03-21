const express=require("express");
const app=express();
const User=require("../models/users.js")
const Product=require("../models/productSchema.js");
const router=express.Router({mergeParams:true});
app.use(express.urlencoded({extended:true}));
const ExpressError=require("../utils/ExpressError.js")
const asyncWrap=require("../utils/AsyncWrap.js")
const {isLoggedIn, saveRedirectUrl, guestModeCart}=require("../middleware.js")
const multer  = require('multer')
const {cloudinary,storage}=require("../cloudConfig.js")
 const parser = multer({ storage: storage });
const methodOverride=require("method-override");


router.get("/product",guestModeCart,async(req,res)=>{
  let products= await Product.find({})
  console.log(products)
    res.render("all/index.ejs",{products:products});
  });

router.get("/product/all",async(req,res)=>{
  let products= await Product.find({});
  let catArr=[]
  let greaterPrice=0;
  let {categorySelectionUser}=req.query
  console.log(categorySelectionUser)
    for (let product of products){
    
     
     let flag=false
      let c= product.category
   
      for( let i of catArr){
         if(c==i){
            flag=true
         }
      }
      if(flag==false){
        if(categorySelectionUser!=c){
          catArr.push(c)
        }
         
      }
      if(product.price>greaterPrice){
        greaterPrice=product.price
      }
      
      
    }

    console.log(catArr)
    
  res.render("all/allproduct.ejs",{products:products, categorySelection:catArr, greaterPrice:greaterPrice, categorySelectionUser:categorySelectionUser})
})

router.get("/product/details/:productId",async (req,res)=>{
  let product=await Product.find({_id:req.params.productId});
  product=product[0]
  console.log("jiji",product)

  let products= await Product.find({});
  let catArr=[]

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
      
      
      
    }

  res.render("all/item_page.ejs",{product:product, categorySelection:catArr,products:products});
})



module.exports=router