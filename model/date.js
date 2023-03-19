const mongoose = require('mongoose');
const dateschema=new mongoose.Schema({
    tripname:{
        required:true,
        type:String,
    },
    date:{
        type:Number,
    },
    month:{
        type:String,
    },
    year:{
        type:String,
    },
    events:[
    ]
})

module.exports = mongoose.model('date', dateschema);