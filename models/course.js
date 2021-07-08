const { Int32 } = require('bson');
const mongoose=require('mongoose');
const Schema = mongoose.Schema;
const tgrade=new Schema({
    classID:
    {type:mongoose.Schema.Types.ObjectId,
    ref:'classes'
    },
    grade:{type:Number,required:true}

});

const courseSchema=new Schema({
    code:
    {
        type:String, 
        required:true
    },
    name:
    {
        type:String, required:true
    },
    deptID:
    {
        type:mongoose.Schema.Types.ObjectId,
        ref:'department'
    },
    classID:
    {type:mongoose.Schema.Types.ObjectId,
    ref:'classes'
    },
    perfGrade : {
        type:Number, required:true 
    },
    finalGrade: {
        type:Number, required:true
    },
    semester : {
        type:Number, required:true 
    },
    academicYear: {
        type:String, required:true
    }
});
var courses= mongoose.model('courses',courseSchema);
module.exports=courses;