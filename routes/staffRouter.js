const express   = require('express');
const mongoose  = require('mongoose');
var passport = require('passport');
var Staff = require('../models/staff');
var Courses = require('../models/course');

var authenticate_staff = require('../authenticate_staff');
const { authenticate } = require('passport');
const staffRouter = express.Router();
staffRouter.use(express.json());

staffRouter.get('/',(req,res)=> {
    res.send('This is staff module');
})
staffRouter.post('/login',authenticate_staff.isLocalAuthenticated, (req,res) => {
        var token = authenticate_staff.getToken({_id:req.user._id});
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: true,userId :req.user._id, token: token, msg: 'You are successfully logged in!'});
});
staffRouter.route('/:staffId')
.get(authenticate_staff.verifyStaff,(req,res,next) => {
    if(req.user._id == req.params.staffId) {
        Staff.findById(req.params.staffId)
        .then((staff) => {
         res.statusCode = 200;
         res.setHeader('Content-Type', 'application/json');
         const staffprofile = staffData(staff) ;
         res.json(staffprofile);
        },(err) => next(err))
        .catch((err) => next(err)); }
        else {
         var err = new Error("you don't have permission to do that");
         err.status = 403;
         return next(err);
        }
})

function staffData(staff) {
    let data = {
        name: staff.name,
        username: staff.username,
        courses :[]
    };
    return data ;
} 
module.exports = staffRouter;
