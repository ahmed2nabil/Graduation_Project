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
studentRouter.post('/',authenticate_admin.verifyAdmin,(req,res)=> {
    if(req.body.deptId == null ){
        return res.status(404).json('deptId parameter required')
    }
    if(req.body.yearNumber == null ){
        return res.status(404).json('yearNumber parameter required')
    }
      Years.findOne({deptId : req.body.deptId,yearNumber : req.body.yearNumber})
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
            phone:element.studentId.phone,
            department:element.studentId.deptID

        }; 
        allStudents.push(studentsData)      
    })}
return allStudents;
}
//////// get a specific student by admin //////////
studentRouter.post('/studentprofile',authenticate_admin.verifyAdmin,(req,res,next) => {
    if(req.body.deptId == null ){
        return res.status(404).json('deptId parameter required')
    }
    if(req.body.yearNumber == null ){
        return res.status(404).json('yearNumber parameter required')
    }
    if(req.body.studentId == null ){
        return res.status(404).json('studentId parameter required')
    }
    Years.findOne({deptId: req.body.deptId,yearNumber :req.body.yearNumber})
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
//////// get a specific student  //////////
 studentRouter.get('/:studentId',authenticate.verifyStudent ,(req,res,next) => {
    if(req.user._id == req.params.studentId) {
   Students.findById(req.params.studentId)
   .populate({
    path : 'classIDs.classID',
    populate : {
      path : 'courseID',
    }
  })
  .populate('deptID')
  .populate('yearID')
 
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
studentRouter.put('/update',authenticate_admin.verifyAdmin,(req,res,cb) => {

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
studentRouter.delete('/delete/:studentId',authenticate_admin.verifyAdmin,(req,res,next) => {
   Students.findByIdAndRemove(req.params.studentId)
   .then(res.json({message:'student is deleted successfully'})
   ,(err)=>{next(err)})
   })
//////////////////////////////
function studentData(student,stuID){
    let studentProfile=
            {
               studentName: student.name,
                userName: student.username,
                email : student.email ,
                phone :  student.phone,
                nationalID:  student.nid, 
                department: student.deptID.name,
                year:student.yearID.name,
                courses:[],
                totalGrade:[] = student.totalGrade
            };            
            
            student.classIDs.forEach(element=>{
                let course = {
                    name : element.classID.courseID.name,
                    CoursePerformanceGrade:element.classID.courseID.perfGrade,
                    CourseFinalGrade:element.classID.courseID.finalGrade
                    
                }; 
                element.classID.students.forEach(i=>{
                    if(i.nid == student.nid) {
                    course.StudentPerformanceGrade=i.grade
                    course.StudentFinalExamGrade=i.finalExam
                    course.StudentTotalGrade=course.StudentPerformanceGrade+ course.StudentFinalExamGrade
                    }
                })
                studentProfile.courses.push(course)
              })
              return studentProfile
}
  
module.exports = studentRouter;
