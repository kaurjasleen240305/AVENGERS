const mongoose = require('mongoose');
const questionschema=new mongoose.Schema({
    tripname:{
        type:String,
    },
    question:{
        type:String,
        required:true,
    },
    options:[
    ],
    users:[
        
    ]
})
module.exports = mongoose.model('question', questionschema);