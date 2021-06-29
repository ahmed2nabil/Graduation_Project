const mongoose=require('mongoose');
const Schema = mongoose.Schema;

const staff=new Schema({
    staffId:
        {type:mongoose.Schema.Types.ObjectId,
        ref:'teachingstaff'}
}, {"_id" : false});

const deptSchema=new Schema({
    id:
    {
        type:String,
        required:true
    },
    name:{type:String, required:true},
    staff:[staff]
});
var dept= mongoose.model('department',deptSchema);
module.exports=dept;
