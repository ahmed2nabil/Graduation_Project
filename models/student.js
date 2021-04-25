const mongoose=require('mongoose');
const Schema = mongoose.Schema;
//middleware support different methods useful for passport auth
const passportLocalMongoose = require('passport-local-mongoose');
const classIDs=new Schema({
    classID:
    {
    type:mongoose.Schema.Types.ObjectId, 
    ref:'classes'
    }
}, {"_id" : false});

const totalGrade=new Schema({
    classID:
    {type:mongoose.Schema.Types.ObjectId, 
    ref:'classes'
    },
    tgrade:{type:Number, required:true},
}, {"_id" : false});
const studentSchema=new Schema({
    nid:
    {
        type:Number,
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
    classIDs:[classIDs],
    totalGrade:[totalGrade]
});
studentSchema.plugin(passportLocalMongoose);//make schema support passport-local-mongoose
var students=mongoose.model('students',studentSchema);
module.exports=students;