const mongoose=require('mongoose');
const { modelName } = require('./student');
const Schema = mongoose.Schema;
const staff=new Schema({
    staffID:
        {type:mongoose.Schema.Types.ObjectId,
        ref:'teachingStaff'}
});
const course=new Schema({
    courseID:
        {type:mongoose.Schema.Types.ObjectId,
        ref:'courses'}
})
const classSchema=new Schema({
    id:
    {type:String, 
    required:true
    },
    name:{type:String, required:true},
    staffID:[staff],
    courseID :[course]   
});
var classes= mongoose.model('classes',classSchema);
module.exports=classes;