const express   = require('express');
const mongoose  = require('mongoose');
var passport = require('passport');
var Students = require('../models/student');
var Courses = require('../models/course');

var authenticate = require('../authenticate');
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
   .populate('courseGrade.courseID')
   .then((student) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    const studentprofile = studentData(student) ;
    studentprofile.totalGivenGrade = getTotalGivenGrade(studentprofile);
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

  function studentData(student) {
      let data = {
          name: student.name,
          username: student.username,
          courses :[]
      };
      let i =0;
      student.courseGrade.forEach(element => {
        data.courses[i] = {courseName:element.courseID.name,
            courseTotalGrade : element.courseID.totalGrade,
            studentGrade : element.grade
        }
        i++;
      });
      return data ;
  } 
function getTotalGivenGrade(student) {
    let sum = 0
    student.courses.forEach(element=> {
   sum += element.courseTotalGrade;     
    });
    return sum * 0.025 ;
}
module.exports = studentRouter;