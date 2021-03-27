const mongoose= require('mongoose');
const students= require('../models/student');
const {MONGO_URI} = require('../config');
const connect = mongoose.connect(MONGO_URI);
connect.then(()=>{
    console.log('connected');
     students.insertMany([{
        id:1,
        name:"Basma Esmail",
        username:"basmaeabas",
        email:"basmaabas755@gmail.com",
        password:"0000",
        phone:'011',
        classID: '601efc58012490066479403c',
        deptID:'601efc8f9ed399244c8ac183',
    },
    {
        id:2,
        name:"Esraa Bhy Eldien",
        username:"esraabhy",
        email:"eb@gmail.com",
        password:'0000',
        phone:'011',
        classID: '601efc58012490066479403c',
        deptID:'601efc8f9ed399244c8ac183'


    },
    {
        id:3,
        name:"Ahmed Nabil",
        username:"ahmednabil",
        email:"aa@gmail.com",
        password:'0000',
        phone:'011',
        classID: '601efc58012490066479403c',
        deptID:'601efc8f9ed399244c8ac183'


    },

]);
        
    
})

