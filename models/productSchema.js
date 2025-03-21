const { string, required } = require("joi");
const mongoose=require("mongoose")
const Schema=mongoose.Schema;



const productSchema=Schema({
    name:{
        type: String,
        required:true

    },
   category:{
        type:String,
        required:true
    },
    saler:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    price:{
        type:Number,
        required:true,
        
    },
    image:[{
        filename:{
            type:String
        },
        url:{
            type:String,
                default:"https://www.luxuryvillasingoa.co.in/wp-content/uploads/2018/05/oceandeck-1024x683.jpg",
            set: (v)=> v===""? "https://www.luxuryvillasingoa.co.in/wp-content/uploads/2018/05/oceandeck-1024x683.jpg":v
        
        }
    }
    ],
    actionAt:[{
        type:Date,
        default:Date.now(),
        required:true
    }],
    quantity:{
        type:Number,
        required:true
    },
    info:{
        type:String
    },
    unit:{
        type:String,
        required:true,
        enum: ["kilogram","litere","piece","gram"],
    },
    
})


module.exports=mongoose.model("Product",productSchema);
