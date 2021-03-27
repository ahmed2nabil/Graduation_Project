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

const totalGrade=new Schema({
    classID:
    {type:mongoose.Schema.Types.ObjectId, 
    ref:'classes'
    },
    tgrade:{type:Number, required:true},
});
const studentSchema=new Schema({
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
        ref:'departments'
    },
    classID:
    {
        type:mongoose.Schema.Types.ObjectId,
        ref:'classes'
    },
    courseGrade:[courseGrade],
    totalGrade:[totalGrade]
});

studentSchema.plugin(passportLocalMongoose);//make schema support passport-local-mongoose
var students=mongoose.model('students',studentSchema);
module.exports=students;