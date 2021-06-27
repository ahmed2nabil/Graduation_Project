const mongoose=require('mongoose');
const Schema=mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');
const responsible=new Schema({
    responsibleID:
        {type:mongoose.Schema.Types.ObjectId,
        ref:'teachingStaff'}
});

const classes =new Schema({
    classID:
        {type:mongoose.Schema.Types.ObjectId,
        ref:'classes'}
});
const rules=new Schema({
    ruleID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'controlRules'
    },
    isActive:{

        type:Boolean,
        required:true
    },
    value:{
        type:Number,
        required:true
    }

})

const controlSchema= new Schema({
    name:{
        type:String,
        required:true

    },
    responsibleIDs:[responsible],
    classes:[classes],
    deptID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'department'
    },
    rules:[rules],
    year : {
        type : Number ,
        required : true
    },
    academicYear : {
        type:mongoose.Schema.Types.ObjectId,
        ref:'year'
    }
});

controlSchema.plugin(passportLocalMongoose);//make schema support passport-local-mongoose
var control=mongoose.model('control',controlSchema);
module.exports=control
