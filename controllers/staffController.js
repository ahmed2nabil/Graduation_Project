const mongoose= require('mongoose');
const students= require('../models/staff');
const {MONGO_URI} = require('../config');
const connect = mongoose.connect(MONGO_URI);
connect.then(()=>{
    console.log('connected');
     students.insertMany([{
        id:1,
        name:"Ahmed Mostafa",
        userName:"drahmedmostafa",
        email:"am@gmail.com",
        password:'0000',
        phone:'011',
        deptID:'601efc8f9ed399244c8ac183'
     
    },
    {
        id:2,
        name:"Adel Fathy",
        userName:"dradelfathy",
        email:"af@gmail.com",
        password:'0000',
        phone:'011',
        deptID:'601efc8f9ed399244c8ac183'


    },
    {
        id:3,
        name:"Mahmoud Ali",
        userName:"drmahmoudali",
        email:"ma@gmail.com",
        password:'0000',
        phone:'011',
        deptID:'601efc8f9ed399244c8ac184'


    },

]);
        
    
})
