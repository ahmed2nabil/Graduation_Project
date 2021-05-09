const mongoose=require('mongoose');
const Schema = mongoose.Schema;

const passportLocalMongoose = require('passport-local-mongoose');

const classIDs=new Schema({
    classID:
    {
    type:mongoose.Schema.Types.ObjectId, 
    ref:'classes'
    }
}, {"_id" : false});
const staffSchema=new Schema({
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
        ref:'department'
    },
    controlID:
    {
        type:mongoose.Schema.Types.ObjectId,
        ref:'control'
    },
    classes:[classIDs]
});
staffSchema.plugin(passportLocalMongoose);//make schema support passport-local-mongoose

var staff= mongoose.model('teachingStaff',staffSchema);
module.exports=staff;