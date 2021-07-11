const mongoose=require('mongoose');
const Schema = mongoose.Schema;

const staff=new Schema({
    staffId:
        {type:mongoose.Schema.Types.ObjectId,
        ref:'teachingStaff'}
}, {"_id" : false});

const Assistants=new Schema({
    assistantId:
        {type:mongoose.Schema.Types.ObjectId,
        ref:'teachingAssistants'}
}, {"_id" : false});

const Graduates=new Schema({
    graduateId:
        {type:mongoose.Schema.Types.ObjectId,
        ref:'graduates'}
}, {"_id" : false}); 

const deptSchema=new Schema({
    id:
    {
        type:String,
        required:true
    },
    name:{type:String, required:true},
    staff:[staff],
    teachingassistants:[Assistants],
    graduates:[Graduates]
});
var dept= mongoose.model('department',deptSchema);
module.exports=dept;
