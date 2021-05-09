const mongoose=require('mongoose');
const Schema=mongoose.Schema;
const rulesSchema= new Schema({
name:{
    type:String,
    required:true
},
descrtiption:{
    type:String,
    required:true
}
})
var controlRules=mongoose.model('controlRules',rulesSchema);
module.exports=controlRules