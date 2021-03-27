const mongoose=require('mongoose');
const classes=require('../models/course');
const {MONGO_URI} = require('../config');
const connect= mongoose.connect(MONGO_URI);
connect.then(()=>{
    console.log('connected');
    classes.insertMany([{
        id:1,
        name:"Java",
        deptID:"601efc8f9ed399244c8ac183",
        tgrade:{classID:"601efc58012490066479403b", grade:150}
        },
        {
        id:2,
        name:"Electronics",
        deptID:"601efc8f9ed399244c8ac185",
        tgrade:{classID:"601efc58012490066479403b", grade:150}
            
        },

])
})