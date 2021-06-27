const mongoose=require('mongoose');
const Schema = mongoose.Schema;

const passportLocalMongoose = require('passport-local-mongoose');


const adminSchema=new Schema({
    
    name:
    {
        type: String,
        required:true
    },
    email:
    {
        type:String,
        required:true
    },
    phone:
    {
        type:String,
        required:true
    },
   username:
   { type: String,
    required:true },
   password:
   { type: Number,
    required:true}
});
adminSchema.plugin(passportLocalMongoose);//make schema support passport-local-mongoose

var admin= mongoose.model('admin',adminSchema);
module.exports=admin;