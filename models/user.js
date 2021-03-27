const  mongoose = require("mongoose");
const Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose'); //autmatically added username and passporwd //plugin into
var User = new Schema({
    admin : {
    type : Boolean,
    default : false 
    }
});

User.plugin(passportLocalMongoose);
module.exports = mongoose.model('User',User);