const mongoose= require('mongoose');
const department= require('../models/department');
const url = 'mongodb://localhost:27017/sysboard';
const {MONGO_URI} = require('../config');
const connect = mongoose.connect(MONGO_URI);
connect.then(()=>
{
    console.log('connected');
     department.insertMany
     ([
        {
        id:1,
        name:"Electrical Engineering",
        sections:
            [{id:1,name:'Computers and Systems'},
            {id:2,name:'Electrical power and Machines '},
            {id:3,name:'Electronics and Communications'}],
        }
    ])
})