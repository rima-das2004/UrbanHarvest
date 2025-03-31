const mongoose=require("mongoose");
const { session } = require("passport");
const Schema=mongoose.Schema;
const orderSchema={
  
    user:{
        type:Schema.Types.ObjectId,
        ref:"User"   ,
        default:null     
    },
    
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
],
totalBill:{
    type:Number
},
paymentType:{
    type:String
},
orderAt:{
    type:Date,
    default:Date.now()
},
orderAddress:{
    type:String

}
}

module.exports=mongoose.model("Order",orderSchema);