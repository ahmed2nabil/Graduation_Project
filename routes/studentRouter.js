const express   = require('express');
const mongoose  = require('mongoose');
var passport = require('passport');
var Students = require('../models/student');
var Classes = require('../models/class');
var Courses = require('../models/course');
var Years = require('../models/year');

var authenticate = require('../authenticate');
const { response } = require('express');
var authenticate_admin = require('../authenticate_admin');

const studentRouter = express.Router();
studentRouter.use(express.json());

///// LOGIN //////
studentRouter.post('/login',authenticate.isLocalAuthenticated, (req,res) => {
   
        var token = authenticate.getToken({_id:req.user._id});
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: true,userId :req.user._id, token: token, msg: 'You are successfully logged in!'});
 
});

//////// get all students  ////////
studentRouter.get('/',authenticate_admin.verifyAdmin,(req,res)=> {
      Years.findById(req.body.yearId)
      .populate('students.studentId')
      .then((year)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        const allStudents = getStudents(year,req.body.deptId);
        res.json(allStudents)
      })
    
})
function getStudents(year,deptId){
    let allStudents=[]
    if(year.deptId==deptId){
    year.students.forEach(element=>{
        let studentsData={
            name:element.studentId.name,
            nationalID:element.studentId.nid,
            email:element.studentId.email,
            username:element.studentId.username,
            phone:element.studentId.phone

        }; 
        allStudents.push(studentsData)      
    })}
return allStudents;
}
//////// get a specific student  //////////
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
//////// get a specific student by admin //////////
studentRouter.route('/studentprofile')
.get(authenticate_admin.verifyAdmin,(req,res,next) => {
   Years.findById(req.body.yearId)
   .then((year) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    if(year.deptId==req.body.deptId)
    {
   Students.findById(req.body.studentId)
   .populate({
    path: "classIDs.classID",
    populate : {
      path : 'courseID',
      
    }
    
  })  .then((student)=>
   {
       let studentProfile=
    {
        studentName:student.name,
        userName:student.username,
        email :student.email ,
        phone : student.phone,
        nationalID: student.nid, 
        courses:[]
    };

      student.classIDs.forEach(element=>{
        let course = {
            name : element.classID.courseID.name
        }; 
        studentProfile.courses.push(course)
      })
      res.json(studentProfile);
    })
    }
   }
   ,(err) => next(err))
})
/// create new student
studentRouter.post('/', authenticate_admin.verifyAdmin,(req,res) => {
    const newStudent = new Students ({
        name : req.body.name,
        nid : req.body.nid,
        userName: req.body.username ,
        email:req.body.email,
        phone:req.body.phone,
        password:req.body.password,
        deptID:req.body.deptID,
     })
     try{
     Students.insertMany(newStudent);
     res.status(201).json(newStudent)    }
     catch(err){
         res.status=400,
         res.json({message:err.message})
     }

})
///// update student data
studentRouter.put('/',authenticate_admin.verifyAdmin,(req,res,cb) => {

Students.findById(req.body.studentId)

.then((student)=>{
    console.log(student)
    if (req.body.name != null){
        student.name=req.body.name
    }

    if (req.body.username != null){
        student.username=req.body.username
    }
    if (req.body.nid != null){
        student.nid=req.body.nid
    }
    if (req.body.email != null){
        student.email=req.body.email
    }
    if (req.body.phone != null){
        student.phone=req.body.phone
    }
    try{

        student.save()
        res.json(student)

    }

    catch(err)
    {
        res.status=400
        res.json({message:err.message})
    }})
})
///// delete a student //////
studentRouter.delete('/',authenticate_admin.verifyAdmin,(req,res,next) => {
   Students.findByIdAndRemove(req.body.studentId)
   .then(res.json({message:'student is deleted successfully'})
   ,(err)=>{next(err)})
   })
//////////////////////////////

  

module.exports = studentRouter;
