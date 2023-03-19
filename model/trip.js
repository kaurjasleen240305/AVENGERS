const mongoose = require('mongoose');
const tripSchema = new mongoose.Schema({
    tripname:{
        type:String,
        required:true,
    },
    members:[
        {type:String}
    ]
})

module.exports = mongoose.model('trip', tripSchema);