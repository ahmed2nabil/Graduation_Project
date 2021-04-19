const express   = require('express');
const mongoose  = require('mongoose');
var passport = require('passport');
var Students = require('../models/student');
var Classes = require('../models/class');
var Courses = require('../models/course');
var authenticate = require('../authenticate');
const { response } = require('express');
const studentRouter = express.Router();
studentRouter.use(express.json());

studentRouter.get('/',(req,res)=> {
    res.send('This is student module');
})
studentRouter.post('/login',authenticate.isLocalAuthenticated, (req,res) => {
        var token = authenticate.getToken({_id:req.user._id});
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: true,userId :req.user._id, token: token, msg: 'You are successfully logged in!'});
 
});

studentRouter.route('/:studentId')
.get(authenticate.verifyStudent,(req,res,next) => {
    if(req.user._id == req.params.studentId) {
   Students.findById(req.params.studentId)
   .populate('classIDs.classID')
   .then((student) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    const studentprofile = studentData(student,req.params.studentId);
    res.json(studentprofile);
   },(err) => next(err))
   .catch((err) => next(err)); }
   else {
    var err = new Error("you don't have permission to do that");
    err.status = 403;
    return next(err);
   }
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

  function studentData(student,stuID) {
      let data = {
          name: student.name,
          username: student.username,
          email : student.email ,
          phone : student.phone,
          ID : student.id,
          courses :[]
      };
      student.classIDs.forEach(element => {
         Courses.findById(element.classID.courseID)
         .then((course) => {     
            console.log(course);
            }); 
    }); 
    return data ;
  } 
function coursesAfter(courses) {
    let sum = 0;
    let failed_courses= [];
    let totalGivenGrade;
    let obj = {};
    //for push failed courses into array && calculate Given Grade
courses.forEach(element=> {  sum += element.courseTotalGrade;  
if (element.percentage <= 50 && element.percentage >= 35) { failed_courses.push(element);
 }});
GivenGrade = sum * 0.025;
 //calculate the degrees needed 
failed_courses.forEach(element => {
    element.degreesNeeded = (element.courseTotalGrade/2) - element.studentGrade; 
});
//add the degrees needed if exixsts
failed_courses.forEach(element => {
    if(GivenGrade >= element.degreesNeeded) {
    element.studentGrade += element.degreesNeeded;
    element.percentage = (element.studentGrade/element.courseTotalGrade) * 100;
    GivenGrade -= element.degreesNeeded;    
}
})
obj.failed_courses = failed_courses;
obj.totalGivenGrades = sum * 0.025;
obj.restGrades = GivenGrade;
    return obj  ;
}
module.exports = studentRouter;