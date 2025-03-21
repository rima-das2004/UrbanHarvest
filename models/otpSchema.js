const mongoose=require("mongoose")
const Schema=mongoose.Schema;
const passportLocalMongoose=require("passport-local-mongoose")


const otpSchema=Schema({
    username:{
        type:String,
        unique:true
    },
    email:{
        type:String,
        unique:true
    },
   otp:{
    type:String,
   },
   expiresAt:{
    type:Date,
    expires:'3m',
   }
    
})

module.exports=mongoose.model("otps",otpSchema);
