const express=require("express");
const app=express();
const User=require("../models/users.js")
const passport=require("passport");
const passportLocal=require("passport-local");
const passportLocalMongoose=require("passport-local-mongoose");
const router=express.Router({mergeParams:true});
app.use(express.urlencoded({extended:true}));
var nodemailer = require('nodemailer');
const crypto = require('crypto');
const OtpDb=require("../models/otpSchema.js")
const tempDb=require("../models/tempSchema.js")
const ExpressError=require("../utils/ExpressError.js")
const asyncWrap=require("../utils/AsyncWrap.js")
const {isLoggedIn, saveRedirectUrl}=require("../middleware.js")
const multer  = require('multer')
const {cloudinary,storage}=require("../cloudConfig.js")
 const parser = multer({ storage: storage });
const methodOverride=require("method-override");

function emailSender(mailOptions){
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        secure:true,
        port:465,
        host:"smtp@gmail.com",
        auth: {
          user: 'contacturbanharvestofficially@gmail.com',
          pass: 'vidm vhmk mhhb jgec'
        }
      });

      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ');
        }
      });

}

function otpSender()
{
    let otp=""
        let otpLength=5;
        
        for (let i = 1; i <= otpLength; i++) {
          otp += Math.floor(Math.random() * 10);
        }

        return otp;
}


router.get("/role",(req,res)=>{
    res.render("all/sign-up-option.ejs")
})
router.get("/signup",(req,res)=>{
    let {role}=req.query;
    
    res.render("all/signup.ejs",{role:role})
})

router.post("/signup",asyncWrap(async(req,res)=>{
    let{role}=req.query;
    
    try{
        let otp=otpSender();
        console.log("in signup",otp)
        let {firstname,lastname,username,email,phone}=req.body.user;
        
        let otpUser= await new OtpDb({
            username:username,
            otp:otp,
            email:email,
            expiresAt:Date.now()+(3*60*1000)
            
        })
        let tempUser=await new tempDb({
            firstname:firstname,
            lastname:lastname,
            username:username,
            email:email,
            phone:phone,
            role:role
        })
        await otpUser.save();
        await tempUser.save();
            console.log("initiate")
      var mailOptions = {
        from:'"Verification" <contacturbanharvestofficially@gmail.com>',
        to: email,
        subject: 'email verification',
        html:`<h1>Dear ${username}<h1/><br><h5>An email verification from Urban Harvest Supermarket</h5><br><p>your otp is ${otp}</p><br><p>Thank you for accesing UrbanHarvest</p>`
      };
          emailSender(mailOptions)
        
        res.render("all/otp.ejs",{role:role,username:username});

    }

    catch(err){
        let tempData=await tempDb.find({username:username})
        req.flash("error",err.message);
        console.log(err)
        res.redirect("/role")
    }
    

 
}))
router.post("/verify",asyncWrap(async(req,res)=>{
    let {role,username}=req.query
    console.log(username)
    
       let otpData=await OtpDb.find({username:username})
  
        if(otpData.length==0 && !otpData[0].otp){
            let delUser=await tempDb.deleteOne({username:username})
            req.flash("error","there is some error");
            res.redirect("/role")
        }

        let tempData=await tempDb.find({username:username})
 
    
    console.log(tempData)
    console.log(otpData)
    tempData=tempData[0]
    console.log(tempData.username)
    let {first,sec,third,fourth,fifth}=req.body;
    let otpVerifyCal=String(first)+String(sec)+String(third)+String(fourth)+String(fifth)
    console.log(otpVerifyCal)
    if((otpData[0].otp) && otpVerifyCal==String(otpData[0].otp) ){

        res.render("all/makePassword.ejs",{username:tempData.username,role:role})

        }
        else{
            let delUser=await tempDb.deleteOne({username:username})
            let otpDEl=await OtpDb.deleteOne({username:username})
            req.flash("error","Otp is incorrect")
            res.redirect("/role")
        }  

}))


router.post("/createAccount",asyncWrap(async(req,res)=>{
    let {role,username}=req.query;
    console.log(req.body)
    let {password,confirmPassword}=req.body
    
    let userData=await tempDb.find({username:username})

    let userSchemaData=await new User({username:userData[0].username,
        firstname:userData[0].firstname,
        lastname:userData[0].lastname,
        email:userData[0].email,
        role:userData[0].role,
        phone:userData[0].phone,
    }) 
  
    if(!userSchemaData){
    console.log(err);
    let delUser=await tempDb.deleteOne({username:username})
    res.redirect("/role")
  }

            
            let regUser=await User.register(userSchemaData,password);
            req.login(regUser,async(err)=>{
                if(err){
                    req.flash("error","error has occured in registration process")
                    console.log(err)
                    res.redirect("/role")
                }
                else{
                    let delUser=await tempDb.deleteOne({username:username})
                    let delOtp=await OtpDb.deleteOne({email:userData[0].email});
                    req.flash("success","Welcome to Urban Harvest")
                    if(role=="supplier"){
                        res.render(`all/welcomeSupplier.ejs`,{username:userData[0].username,
                        })
                    }
                    else{
                        res.redirect("/product");
                    }
                   
                }
            

                
})

}
// login process----------------------->
))
router.get("/loginRole",(req,res)=>{
    res.render("all/sign-in-options.ejs")
})

router.get("/login",saveRedirectUrl,(req,res)=>{
    let {role}=req.query;

    res.render("all/sign-in",{role:role})
})

router.post("/login",saveRedirectUrl,passport.authenticate("local",{failureRedirect:"/login",failureFlash:true}),async(req,res)=>{
    let {role}=req.query
    let redirectUrl=res.locals.redirectUrl;
    if(redirectUrl){
        req.flash("success","Welcome back to UrbanHarvest");
        res.redirect(redirectUrl)
    }
    else{
      

        if(role=="supplier"){
            let supplier=await User.find({username:req.body.username})
            console.log("hh",supplier[0])
            req.flash("success","Welcome back to UrbanHarvest");
            
            res.redirect(`/supplier/${req.body.username}`)
        }
        else{
        res.redirect("/product")
    }
    }

})

router.get("/logout",async (req,res)=>{
    req.logout((err)=>{
        if(err){
            return next(err)
        }
        req.flash("success","you are successfully logged out")
        res.redirect("/product")
    })
})
// forgot password------------------------------->
router.get("/forgotPassword",(req,res)=>{
    let{role}=req.query
    res.render("all/forgot_password.ejs",{role:role})
})

router.post('/forgotPassword',asyncWrap( async (req, res,next) => {
    let{role}=req.query;
    console.log(req.query)
    try {
      const user = await User.findOne({ email: req.body.email });
      if (!user) {throw new ExpressError(400,"User Not found")};
  
      // Generate reset token
      const token = crypto.randomBytes(32).toString('hex');
      user.resetPasswordToken = token;
      user.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiry
      await user.save();
      const mailOptions = {
        to: user.email,
        from: process.env.EMAIL_USER,
        subject: 'Password Reset',
        text: `You requested a password reset. Click the link below:\n\n
        http://localhost:8080/resetPassword/${token}`
      };
      emailSender(mailOptions)
      res.render("all/forgot_password_info.ejs")
    
    }
    
    catch(err){
        console.log(err);
      
    }
    
    }))

router.get("/resetPassword/:token",(req,res)=>{
    let {token}=req.params;
    res.render("all/changePassword2.ejs",{token:token})
})
    router.post('/resetPassword/:token', async (req, res) => {
        try {
          const user = await User.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() }
          });
      
          if (!user) 
        {
            res.render("all/token_expired.ejs");
        }
      
          
          await user.setPassword(req.body.password);
          user.resetPasswordToken = undefined;
          user.resetPasswordExpires = undefined;
          await user.save();
      
         req.flash("success","Password Changed Successfully!!");
         res.redirect("/product")
      
        } catch (err) {
          res.status(500).json({ message: err.message });
        }
      });


    // change password----------------------------->  

    router.get("/changePassword",isLoggedIn,(req,res)=>{
        let id=req.user._id
        console.log(id)
        res.render("all/change_Pass.ejs",{id:id})
    })

    router.post("/changePassword",isLoggedIn,asyncWrap(async (req,res)=>{
        let {id}=req.query
        let user=await User.findById(id);
        console.log(user)
        let {Oldpassword,newPassword}=req.body
        await user.changePassword(Oldpassword,newPassword);
        await user.save();
        req.flash("success","password is changed successfully")
        res.redirect("/product");
        
    }))




    //Account Details ------------------------------------------>
    router.get("/accountDetails/:id",isLoggedIn,asyncWrap(async(req,res)=>{
        let {id}=req.params;
        let user=await User.findById(id);
        console.log(user);
        if(user.role=="supplier"){
            res.render("all/supplierProfile.ejs",user)
        }
        else{
            res.render("all/profile.ejs",user)
        }
     
    }))

    router.get("/updateAccount/:id",isLoggedIn,asyncWrap(async (req,res)=>{
        let {id}=req.params;
        let user=await User.findById(id)
        console.log(user);
        res.render("all/profileEdit.ejs",user)
    }))
    router.put("/updateAccount/:id",parser.single("image"),isLoggedIn,asyncWrap(async (req,res)=>{
        console.log("in u acc")
        let {id}=req.params
        
        let user =await User.findById(id)
        let {firstname,lastname,phone,address,country}=req.body;
        let userUpdate=await User.findByIdAndUpdate(id,{
            firstname:firstname,
            lastname:lastname,
            phone:phone,
            address:address,
            country:country,
            
        })
    
        if(!(typeof(req.file)=="undefined")){
            let url=req.file.path;
            let filename=req.file.filename;
            console.log(url,"...",filename);
            await cloudinary.uploader
            .destroy(user.image.url)
            .then(result => console.log(result));
            console.log(user.image.url)
            userUpdate.image={url,filename}
        }
       let updated= await userUpdate.save()
       
       
        req.flash("success","Updated successfully");
        res.redirect(`/accountDetails/${id}`);


    }))
module.exports=router