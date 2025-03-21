const mongoose=require("mongoose");
const { session } = require("passport");
const Schema=mongoose.Schema;
const cartSchema={
    status:{
        type:String,
        enum:["active","checked-out"]

    },
    user:{
        type:Schema.Types.ObjectId,
        ref:"User"   ,
        default:null     
    },
    sessionId:{
        type:String,
        default:null
    }
    ,
    product:[
        {
        Details:{
        type:Schema.Types.ObjectId,
        ref:"Product"
    },
        ChoosenQuantity:{
            type:Number,
            default:1
        }
    }
]
}

module.exports=mongoose.model("Cart",cartSchema);