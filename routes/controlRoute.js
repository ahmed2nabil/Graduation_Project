const express      = require('express');
const mongoose     = require('mongoose');
const passport     = require('passport');
const { Parser }   = require('json2csv');
const multer       = require('multer');
const csv2json     = require('csv2json');
const fast_csv     = require('fast-csv');
const fs           = require('fs');
const path         = require('path');
const Staff        = require('../models/staff');
const Control      = require('../models/control');
const ControlRules = require('../models/controlRules');
const Class        = require('../models/class');
const Students     = require('../models/student');
const Departments  = require('../models/department');

const authenticate_control = require('../authenticate_control');
const control = require('../models/control');
const { authenticate } = require('passport');
const staff = require('../models/staff');
const upload = multer({ dest: 'public/import/' });
const controlRouter = express.Router();
controlRouter.use(express.json());

controlRouter.get('/',(req,res) => {
res.status(200).json({msg:'This is Control module'});
})
//=====================================Control login ====================//

controlRouter.post('/login',authenticate_control.isControlResponsible,(req,res) => {
    var token = authenticate_control.getToken({_id:req.user._id});
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({success: true,userId :req.user._id,controlId : req.user.controlID, token: token, msg: 'You are successfully logged in!'});
  
})


//----------------------------------Control Home Page -----------------------------------//
controlRouter.route('/:staffId/:controlId')
.get(authenticate_control.verifyControl,(req,res,next) =>{
    Control.findById(req.params.controlId)
    .populate('deptID')
    .populate('responsibleIDs.responsibleID')
    .then((control) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
      const controlData =  prettyControlProfile(control);
        res.json(controlData);
    },(err) => next(err)) 
    .catch((err)=> next(err));
})
//------------------------------------ Control Rules -----------------------------//
controlRouter.route('/:staffId/:controlId/rules')
.get(authenticate_control.verifyControl,(req,res,next) =>{
    Control.findById(req.params.controlId)
    .populate('rules.ruleID')
    .then((controlinfo) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(controlinfo.rules);
    },(err) => next(err)) 
    .catch((err)=> next(err));
})
//=====================================Control list of classes ====================//
controlRouter.route('/:staffId/:controlId/classes')
.get(authenticate_control.verifyControl,(req,res,next) =>{
    Control.findById(req.params.controlId)
    .populate({
      path : 'classes.classID',
      populate : {
        path : 'courseID'
      }
    })
    .then((control) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        const coursesData = prettyCoursesList(control);
        res.json(coursesData);
    },(err) => next(err)) 
    .catch((err)=> next(err));
})
//=====================================Control specfic class/course (list of students)====================//
controlRouter.route('/:staffId/:controlId/classes/:classId')
.get(authenticate_control.verifyControl,(req,res,next) =>{
    Class.findById(req.params.classId)
    .populate('students.studentID')
    .then((classinfo) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        const stu = prettyAllStudentsClass(classinfo);
        res.json(stu);
    },(err) => next(err)) 
    .catch((err)=> next(err));
})
//====================== get CSV list of student =====================//
controlRouter.route('/:staffId/:controlId/classes/:classId/csv')
.get(authenticate_control.verifyControl,(req,res,next) =>{
    Class.findById(req.params.classId)
    .populate('students.studentID')
    .then((classinfo) => {
        const stu = prettyAllStudentsClass(classinfo);
        let csv;
        try {
            const json2csvParser = new Parser();
             csv = json2csvParser.parse(stu);
          } catch (err) {
            console.error(err);
           return res.status(500).send(error.message)
          }
          const filepath = path.join(__dirname,"..","public","exports","students.csv" )
          fs.writeFile(filepath,csv, function(err){
            if(err) {
              return res.status(500).json(err);
            }else {
              return res.json("/exports/students.csv");
            }
          })
    },(err) => next(err)) 
    .catch((err)=> next(err));
})
//============================upload csv ============================//
.post(authenticate_control.verifyControl,upload.single('file'),(req,res) => {
  const fileRows = [];
//   open uploaded file
fast_csv.parseFile(req.file.path,{headers : true})
  .on("data", function (data) {
    fileRows.push(data); // push each row
  })
  .on("end", function () {
    fs.unlinkSync(req.file.path);   // remove temp file
    //process "fileRows" and respond
   if(fileRows.length == 0) {
     res.statusCode = 404;
     res.json({msg:'Failed uploaded'})
   }
   res.statusCode = 200 ;
   res.json({msg:'uploaded Successfully',studentsData:fileRows});
})
})
//==============================update All Student Grade================================//
.put(authenticate_control.verifyControl,upload.single('file'),(req,res) => {
  const fileRows = [];
//   open uploaded file
fast_csv.parseFile(req.file.path,{headers : true})
  .on("data", function (data) {
    fileRows.push(data); // push each row
  })
  .on("end", function () {
    fs.unlinkSync(req.file.path);   // remove temp file
    //process "fileRows" and respond
   if(fileRows.length == 0) {
     res.statusCode = 404;
     res.json({msg:'Failed uploaded'})
   }
   Class.findOne(
     {_id : req.params.classId},
     function(err,classinfo) {
       classinfo.students.forEach(stu => {
         fileRows.forEach(row => {
           if(stu.nid == row.nid)
           {
             stu.grade = row.grade ;
             stu.finalExam = row.finalExam;
           }
         })
       }) ;
       classinfo.save();
      res.statusCode = 200 ;
      res.json({msg:'updated Successfully',students:classinfo.students});
     }
    )

})
})
//==============================helpers Function =======================================//
function prettyControlProfile(controlinfo) {
  let finalData = {
    controlName : controlinfo.name,
    year :  controlinfo.year,
    responsibleData : {
      name : controlinfo.responsibleIDs[0].responsibleID.name,
      username :controlinfo.responsibleIDs[0].responsibleID.username,
      email : controlinfo.responsibleIDs[0].responsibleID.email
     } ,
     departmentData :{
      name : controlinfo.deptID.name,
      sections: []
     },

  }
  if(controlinfo.deptID.sections) {
    controlinfo.deptID.sections.forEach(element => {
      finalData.departmentData.sections.push(element.name);
    })
  }
  return finalData;
}

function prettyCoursesList(control){
  let listCourses = [];
  control.classes.forEach(element => {
    let temp ={
      classId : element.classID._id,
      courseId : element.classID.courseID._id,
      semester : element.classID.courseID.semester,
      year :  element.classID.year,
      name :element.classID.courseID.name,
      code :element.classID.courseID.code,
       perfGrade :element.classID.courseID.perfGrade,
      finalGrade :element.classID.courseID.finalGrade
    }
  listCourses.push(temp);
        }) 
  return listCourses;
}
//for class
function prettyAllStudentsClass(classinfo) {
  const stu = classinfo.students ;
  let arrayofstudents = [];
  stu.forEach(element => {
      let temp = {
          studentID : element.studentID._id,
          name : element.studentID.name,
          nid : element.nid,
          state : element.state,
          attemp : element.attemp,
          grade: element.grade,
          finalExam : element.finalExam
      }
      arrayofstudents.push(temp);
  });
  
  return arrayofstudents;
  }

module.exports = controlRouter;