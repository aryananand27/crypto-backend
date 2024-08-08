const mongoose=require("mongoose");

const AlertSchema=new mongoose.Schema({
    userId:{
        type:String,
        require:true,
        unique:true
    },
    alert:[
        {
            coin:{
                type:String,
                require:true
            },
            price:{
                type:String,
                require:true
            }
        }
    ]
})

module.exports=mongoose.model('alerts',AlertSchema);