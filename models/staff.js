const mongoose=require('mongoose');
const Schema = mongoose.Schema;
const staffSchema=new Schema({
    id:
    {
        type:String, required:true
    },
    name:
    {
        type: String,
        required:true
    },
    userName:
    {
        type:String,
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
    password:
    {
        type:String,
        required:true
    },
    deptID:
    {
        type:mongoose.Schema.Types.ObjectId,
        ref:'department'
    },
});
var staff= mongoose.model('teachingStaff',staffSchema);
module.exports=staff;