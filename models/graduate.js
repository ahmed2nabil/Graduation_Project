const mongoose=require('mongoose');
const Schema = mongoose.Schema;
//middleware support different methods useful for passport auth
const passportLocalMongoose = require('passport-local-mongoose');

const courseGrade=new Schema({
    courseID:
    {type:mongoose.Schema.Types.ObjectId, 
    ref:'courses'
    },
    grade:{type:Number, required:true},
    year:{type:Number, required:true}
}); 


const graduateSchema=new Schema({
    id:
    {
        type:String,
        required:true
    },
    name:
    {
        type: String,
        required:true
    },
    username:{
        type: String,
        required:true
    },
    password:{
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
    deptID:
    {
        type:mongoose.Schema.Types.ObjectId,
        ref:'departments'
    },
    totalGrade:
    {
        type: Number,
    },
    courseGrade:[courseGrade],

});

graduateSchema.plugin(passportLocalMongoose);//make schema support passport-local-mongoose
var graduates=mongoose.model('graduates',graduateSchema);
module.exports=graduates;