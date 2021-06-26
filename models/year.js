const mongoose=require('mongoose');
const Schema=mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');
const students= new Schema({
    studentId:
    {
    type:mongoose.Schema.Types.ObjectId, 
    ref:'students'
    }
})
const yearSchema = new Schema({
    name:
    {type: String,
    required:true },
    deptId:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref:'department'
    },
    students:[students]

})
yearSchema.plugin(passportLocalMongoose);//make schema support passport-local-mongoose
var years=mongoose.model('year',yearSchema);
module.exports=years;