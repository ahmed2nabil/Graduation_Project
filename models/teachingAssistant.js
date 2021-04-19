const mongoose=require('mongoose');
const Schema = mongoose.Schema;
//middleware support different methods useful for passport auth
const passportLocalMongoose = require('passport-local-mongoose');

const teachingAssistantSchema=new Schema({
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
        ref:'department'
    },
    classIDs:[classIDs]
});

teachingAssistantSchema.plugin(passportLocalMongoose);//make schema support passport-local-mongoose
var teachingAssistants=mongoose.model('teachingAssistants',teachingAssistantSchema);
module.exports=teachingAssistants;