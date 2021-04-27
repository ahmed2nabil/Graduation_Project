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
   .populate({
    path : 'classIDs.classID',
    populate : {
      path : 'courseID'
    }
  })
//    .populate('classIDs.classID')
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

  function  studentData(student,stuID) {
      let data = {
          name: student.name,
          username: student.username,
          email : student.email ,
          phone : student.phone,
          nid : student.nid,
          courses :[]
      };

      student.classIDs.forEach(element => {
          let course = {
              name : element.classID.courseID.name,
              perfGrade : element.classID.courseID.perfGrade,
              finalGrade : element.classID.courseID.finalGrade,
              totalGrade : element.classID.courseID.finalGrade + element.classID.courseID.perfGrade
          }; 
          element.classID.students.forEach(element => {
              if(element.studentID == stuID) {
                  course.studentPerfGrade = element.grade;
                  course.studentTotalGrade = element.finalExam + element.grade;
                }
          });
          course.totalpercentage = (course.studentTotalGrade/course.totalGrade)*100;
          data.courses.push(course);
    })
    let result = 0 ;
    data.courses.forEach(element => {
       result += element.studentTotalGrade 
    });
    data.totalCoursesGrade = result;
return data;
  } 

module.exports = studentRouter;