const mongoose = require('mongoose');
const requischema=new mongoose.Schema({
    tripname:{
        type:String,
        required:true,
    },
    requisite:{
        type:String,
    }
         
})
module.exports = mongoose.model('requi', requischema);