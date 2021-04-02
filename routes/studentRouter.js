const express   = require('express');
const mongoose  = require('mongoose');
var passport = require('passport');
const bodyParser = require('body-parser');
var Students = require('../models/student');
var Courses = require('../models/course');
const studentRouter = express.Router();
studentRouter.use(bodyParser.json());

studentRouter.post('/login',passport.authenticate('local'), (req,res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type','application/json');
   res.json({success : true,status : 'You are succesfully logged in'});
// console.log(req.user._id);
// res.redirect('/student/'+ req.user._id);
  });

  function auth(req,res,next){
    if(!req.user){  //make sure of cookies exists
        var err = new Error("you are not authenticated!");
        err.status = 403;
        return next(err);
    }
    else {
        next();
    }
  }
studentRouter.use(auth);
studentRouter.route('/:studentId')
.get((req,res,next) => {

    //1- want to get student by id
    //console.log(req.params.studentId);
    console.log(req.user._id);
    console.log(req.params.studentId);
    if(req.user._id == req.params.studentId) {
   Students.findById(req.params.studentId)
   .populate('courseGrade.courseID')
   .then((student) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(student);
   },(err) => next(err))
   .catch((err) => next(err)); }
   else {
    var err = new Error("you don't have permission to do that");
    err.status = 403;
    return next(err);
   }
    //2- get the array of grades 
    //3- get course name from course_id inside the array of grades
    //4- put it into array of objects ["course_name":"value","grade":"value"]
    //5- send also the value of total_grade
    //finished!!! 
    // res.send('all grades for all courses');
})
.post((req,res,cb) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /student');
})
.put((req,res,cb) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /student');
})
.delete((req,res,cb) => {
    res.statusCode = 403;
    res.end('Delete operation not supported on /student');
})
function auth(req,res,next){
    if(!req.user){  //make sure of cookies exists
        var err = new Error("you are not authenticated!");
        err.status = 403;
        return next(err);
    }
    else {
        next();
    }
  }
module.exports = studentRouter;