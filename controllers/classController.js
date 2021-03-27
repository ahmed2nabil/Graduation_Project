const mongoose=require('mongoose');
const classes=require('../models/class');
const url='mongodb://localhost:27017/sysboard';
const {MONGO_URI} = require('../config');
const connect= mongoose.connect(MONGO_URI);
connect.then(()=>{
    console.log('connected');
     classes.insertMany([{
        id:11,
        name:'first',
    },
    {
        id:12,
        name:'second',},
    {
        id:13,
        name:'third',},
     {
        id:14,
        name:'fourth',}
]) 
    
})