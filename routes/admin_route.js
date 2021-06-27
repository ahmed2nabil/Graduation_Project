const express      = require('express');
const mongoose     = require('mongoose');
const passport     = require('passport');
const classes    = require('../models/class');
var authenticate = require('../authenticate_admin');
const adminroute = express.Router();

adminroute.post('/login',authenticate.isLocalAuthenticated,(req,res) => {
    var token = authenticate.getToken({_id:req.user._id});
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({success: true,userId :req.user._id,adminlId : req.user.adminID, token: token, msg: 'You are successfully logged in!'});
  
})

adminroute.get('/',authenticate.isLocalAuthenticated,(req,res)=>{
    res.send('this is Dashboard')

})


module.exports=adminroute;