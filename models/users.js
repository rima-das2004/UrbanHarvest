const { required } = require("joi");
const mongoose=require("mongoose")
const Schema=mongoose.Schema;
const passportLocalMongoose=require("passport-local-mongoose")


const userSchema=Schema({
    firstname:{
        type: String,

    },
    lastname:{
        type:String
    },
    username:{
        type:String,
        unique:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    role:{
        type:String,
        required:true,
        enum: ["admin", "user","supplier"], // Only allow these values
  },
    image:{
        filename:{
            type:String,
            default:"filename"
        },
        url:{
            type:String,
            default:"https://cdn-icons-png.flaticon.com/512/4018/4018431.png",
            set: (v)=> v===""? "https://cdn-icons-png.flaticon.com/512/4018/4018431.png":v
        }
    },
    phone:{
        type:Number,
        required:true
    },
    SignedUpAt:{
        type:Date,
        default:Date.now(),
    },
    cart:{
        type:Schema.Types.ObjectId,
        ref:"Cart",
        default:null
    },
    review:[{
        type:Schema.Types.ObjectId,
        ref:"Review"
    }],
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    address:{
        type:String,
        default:"Kolkata"
    },
    country:{
        type:String,
        default:"India"
    },
    

})

userSchema.plugin(passportLocalMongoose);
module.exports=mongoose.model("User",userSchema);
