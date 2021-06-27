const mongoose=require('mongoose');
const Schema=mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');
const students= new Schema({
    studentId:
    {
    type:mongoose.Schema.Types.ObjectId, 
    ref:'students'
    }
},{"_id" : false});
const classes =new Schema({
    classID:
        {type:mongoose.Schema.Types.ObjectId,
        ref:'classes'}
},{"_id" : false});
const yearSchema = new Schema({
    name:
    {type: String,
    required:true },
    yearNumber : {
        type: Number
    },
    deptId:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref:'department'
    },
    students:[students],
    classes : [classes],
    classesOLD : [classes],
})
yearSchema.plugin(passportLocalMongoose);//make schema support passport-local-mongoose
var years=mongoose.model('year',yearSchema);
module.exports=years;