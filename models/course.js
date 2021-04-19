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
    id:
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
    Grade : {
        type:Number, required:true 
    },
    totalGrade: {
        type:Number, required:true
    }
});
var courses= mongoose.model('courses',courseSchema);
module.exports=courses;