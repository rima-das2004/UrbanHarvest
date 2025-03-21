const mongoose=require("mongoose")
const Schema=mongoose.Schema;
const passportLocalMongoose=require("passport-local-mongoose")


const tempSchema=Schema({
    firstname:{
        type: String,

    },
    lastname:{
        type:String
    },
    username:{
        type:String
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    role:{
        type:String,
        required:true

    },
    phone:{
        type:Number,
        required:true
    },
    SignedUpAt:{
        type:Date,
        default:Date.now(),
    }
})


module.exports=mongoose.model("temp",tempSchema);
