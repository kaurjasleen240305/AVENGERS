const mongoose = require('mongoose');
const expenseschema=new mongoose.Schema({
   tripname:{
    type:String,
    required:true,
   },
    material:{
        type:String,
    },
    date:{
        type:String,
    },
    amount:{
        type:Number,
    },
    user:{
        type:String
    },
})
module.exports = mongoose.model('expense', expenseschema);