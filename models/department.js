const mongoose=require('mongoose');
const Schema = mongoose.Schema;
const sections=new Schema({
    id:
    {
        type:String,
        
    },
    name:
    {
        type:String,
        required:true
    }

});


const deptSchema=new Schema({
    id:
    {
        type:String,
        required:true
    },
    name:{type:String, required:true},
    sections:[sections],
    staff:[{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'staff'
    }]
});
var dept= mongoose.model('department',deptSchema);
module.exports=dept;