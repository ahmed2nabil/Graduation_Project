const mongoose=require('mongoose');
const { modelName } = require('./student');
const Schema = mongoose.Schema;
const staff=new Schema({
    staffID:
        {type:mongoose.Schema.Types.ObjectId,
        ref:'teachingStaff'}
})
const classSchema=new Schema({
    id:
    {type:String, 
    required:true
    },
    name:{type:String, required:true},
    staffID:[staff]
    
});
var classes= mongoose.model('classes',classSchema);
module.exports=classes;