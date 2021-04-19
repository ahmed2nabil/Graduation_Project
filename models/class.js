const mongoose=require('mongoose');
const { modelName } = require('./student');
const Schema = mongoose.Schema;
const staff=new Schema({
    staffID:
        {type:mongoose.Schema.Types.ObjectId,
        ref:'teachingStaff'}
});
const student=new Schema({
    studentID:
        {
        type:mongoose.Schema.Types.ObjectId,
        ref:'students'},
    state: {
        type : String,
        required :true
    },
    attemp: {
        type: Number ,
        required : true
    },
    grade: {
        type: Number ,
        required : true
    },
    finalExam: {
        type: Number ,
        required : true
    }
})
const classSchema=new Schema({
    courseCode:
    {type:String, 
    required:true
    },
    staffIDs:[staff],
    teachingassistantID :{
        type:mongoose.Schema.Types.ObjectId,
        ref:'teachingAssistants'
    } ,
    courseID :{
        type:mongoose.Schema.Types.ObjectId,
        ref:'courses'
    } ,
    students :[student],
    year : {
        type : Number ,
        required : true
    }
});
var classes= mongoose.model('classes',classSchema);
module.exports=classes;