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
const Course       = require("../models/course");
const Year         = require ("../models/year");

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
        const CoursesData = prettyCoursesList(control);
        res.json(CoursesData);
    },(err) => next(err)) 
    .catch((err)=> next(err));
})
//=====================================Control specific class/course (list of students)====================//
controlRouter.route('/:staffId/:controlId/classes/:classId')
.get(authenticate_control.verifyControl,(req,res,next) =>{
    Class.findById(req.params.classId)
    .populate('students.studentID')
    .populate('courseID')
    .then((classinfo) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        const stu = prettyAllStudentsClass(classinfo);
        let courseInfo = {
          name : classinfo.courseID.name,
          code : classinfo.courseID.code,
          perfGrade : classinfo.courseID.perfGrade,
          finalGrade : classinfo.courseID.finalGrade,
          semester : classinfo.courseID.semester
        }
        res.json({course :courseInfo,student :stu});
    },(err) => next(err)) 
    .catch((err)=> next(err));
})

// ______________________________ last updates _____________________________________________
.post(authenticate_control.verifyControl,async (req,res,next) =>{ 
  Class.findById(req.params.classId)
    .populate('courseID')
    .populate('students.studentID')
    .populate('students.studentID')
    .then((classinfo) => {

      let  course = manipulateCourse(classinfo.courseID);
      let stu = prettyAllStudentsClass(classinfo);
      apply2PercentagToPass(stu,course);
      apply2PercentagToUpgrade(stu,course);
      saveGradesToStudents(classinfo.students,stu);
      classinfo.save();
      console.log(classinfo.students);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json({course : course,students : stu});
  },(err) => next(err)) 
    /*.then(async(classinfo) => {

      let course_total_grade = classinfo.courseID.perfGrade + classinfo.courseID.finalGrade;
      let list_of_students =classinfo.students;
      check_50_success(course_total_grade,list_of_students);
      await classinfo.save();

      return classinfo;
    })
    .then(async(classinfo)=>{
      let course_total_grade = classinfo.courseID.perfGrade + classinfo.courseID.finalGrade;
      let list_of_students =classinfo.students;
      modify_returning_students_grades (course_total_grade,list_of_students);
      await classinfo.save();
      res.json(classinfo)

      return classinfo;
   })
  */
  .catch((err)=> next(err));

})


//_________________________________ functions _______________________________
function check_50_success (course_total_grade,list_of_students){

  let minimumGrade = course_total_grade *0.5;
  let number_of_passed_students = 0;
  let number_of_failed_students = 0;
  let list_of_failed_students =[];
  let half_of_students = list_of_students.length * 0.5;

  for (i=0;i<list_of_students.length;i++){

    student_total_grade = list_of_students[i].totalGrade
    if (student_total_grade >= minimumGrade){
      number_of_passed_students=number_of_passed_students+1;
    }else{
      number_of_failed_students =number_of_failed_students+1;
      list_of_failed_students.push(list_of_students[i]);
    } 
  }

  let list_of_grades = []; //grades of failed students 
  let update_grade = 0 ; // grade to add to all students to adjust percentage
  if (number_of_passed_students < half_of_students)
  {
    let students_to_update = Math.ceil (half_of_students-number_of_passed_students);
    for (i=0;i<list_of_failed_students.length;i++){
      grade =list_of_failed_students[i].totalGrade; //
      list_of_grades.push(grade);
    }
    list_of_grades.sort(function(a, b){return b - a});
    update_grade = minimumGrade -list_of_grades[students_to_update-1]; 
  }

  for (i=0;i<list_of_students.length;i++){
    before_grade = list_of_students[i].totalGrade;
    after_grade  = list_of_students[i].totalGrade + update_grade 
    if (before_grade < (0.5 * course_total_grade)){
      if (after_grade > 0.5 * course_total_grade){
        after_grade = 0.5 * course_total_grade;
      }
    }
    else if(before_grade <(0.65 * course_total_grade)){
      if (after_grade > 0.65 * course_total_grade){
        after_grade = 0.65 * course_total_grade;
      }
    }
    else if (before_grade <(0.75 * course_total_grade)){
      if (after_grade > 0.75 * course_total_grade){
        after_grade = 0.75 * course_total_grade;
      }
    }
    else if (before_grade <(0.85 * course_total_grade)){
      if (after_grade > 0.85 * course_total_grade){
        after_grade = 0.85 * course_total_grade;
      }
    }else{
      if (after_grade >  course_total_grade){
        after_grade =  course_total_grade;
      }
    }
    list_of_students[i].totalGrade = after_grade ;
  }
}

function modify_returning_students_grades (course_total_grade,list_of_students ){
  for (i=0;i<list_of_students.length;i++){
    if (list_of_students[i].state === "O" || list_of_students[i].state === "F"  ){
      if (list_of_students[i].totalGrade>= 0.65 * course_total_grade){
        list_of_students[i].totalGrade = 0.65 * course_total_grade - 0.5 ;
      }
    }
  }
}

//_______________________upgrading rules _____________________________________________
controlRouter.route('/:staffId/:controlId/upgrade/:yearId')
.get(authenticate_control.verifyControl,(req,res,next) =>{
  Year.findById(req.params.yearId)
  .populate({
    path : 'students.studentId',
    populate : {
      path : 'classIDs.classID',
      populate : {
        path : 'courseID'}
    }
  })
  .then((yearInfo)=>{
    
    storeTotalGrade (yearInfo.students);
    res.json(yearInfo);

  })
})
.post(authenticate_control.verifyControl,(req,res,next) =>{
    Year.findById(req.params.yearId)
    .populate({
      path : 'students.studentId',
      populate : {
        path : 'classIDs.classID',
        populate : {
          path : 'courseID'}
      }
    })
    .then((yearInfo)=>{
      
      applyUpgradingRules (yearInfo.students);
      res.json(yearInfo);

    })
})
async function  storeTotalGrade (list_of_students){
  for (i=0;i<list_of_students.length ;i++){
    let classes = list_of_students[i].studentId.classIDs;
    let student_grade = 0;
    let total_year_grade = 0;
    for(y=0;y<classes.length;y++){
      spc_class = classes[y].classID;
      for (x=0;x<spc_class.students.length;x++){
        
        if (spc_class.students[x].nid == list_of_students[i].studentId.nid){
          student_grade = spc_class.students[x].totalGrade;
          break;
        }
      }
      total_year_grade =total_year_grade +student_grade;
    }
    try{

      let specific_student = await Students.findById(list_of_students[i].studentId._id);
      specific_student.totalGrade.push(total_year_grade);
      await specific_student.save();
    }
    catch (err){
      console.log(err)
    }
  
  
  
  }
}
async function applyUpgradingRules (list_of_students){

  for (i=0;i<list_of_students.length ;i++){

    let classes = list_of_students[i].studentId.classIDs;
    let list_of_failed_classes=[];
    let upgrade_grades = 0;  // grades available to upgrade student 
    let total_grades =0;     // sum of all the maximum grades of students courses ( new / old )
    let student_grade = 0;   // total grade of student in a course
    let student_index_in_class = 0; 
    
    for(y=0;y<classes.length;y++){
      
      spc_class = classes[y].classID;
      let course_grade = spc_class.courseID.perfGrade + spc_class.courseID.finalGrade;
      total_grades = total_grades + course_grade;
      for (x=0;x<spc_class.students.length;x++){
        
        if (spc_class.students[x].nid == list_of_students[i].studentId.nid){
          student_grade = spc_class.students[x].totalGrade;
          student_index_in_class = x;
          break;
        }
      }

      if(student_grade < (course_grade * 0.5) && student_grade > (course_grade * 0.35)){
        let grades_to_success = (course_grade*0.5)-student_grade;
        list_of_failed_classes.push({class:spc_class,class_index:y,index_in_class:student_index_in_class,grades_to_success:grades_to_success});
      }

    }
    
    upgrade_grades = total_grades * 0.025
    list_of_failed_classes.sort((firstItem, secondItem) => firstItem.grades_to_success - secondItem.grades_to_success)
    let grades_added = 0; 
    if (list_of_failed_classes.length >0){
      for(m=0;m<list_of_failed_classes.length;m++){
        if (upgrade_grades > list_of_failed_classes[m].grades_to_success){ 
          try{

            let specific_class = await Class.findById(list_of_failed_classes[m].class._id);
            specific_class.students[list_of_failed_classes[m].index_in_class].totalGrade =list_of_failed_classes[m].class.students [list_of_failed_classes[m].index_in_class].totalGrade+list_of_failed_classes[m].grades_to_success;
            await specific_class.save();
            upgrade_grades = upgrade_grades - list_of_failed_classes[m].grades_to_success;
            grades_added = grades_added + list_of_failed_classes[m].grades_to_success;
          }
          catch (err){
            console.log(err)
          }
        }
      }
      let index = list_of_students[i].studentId.totalGrade.length - 1;
      let total_year_grade =list_of_students[i].studentId.totalGrade[index];
      try{

        let specific_student = await Students.findById(list_of_students[i].studentId._id);
        specific_student.totalGrade.pop();
        specific_student.totalGrade.push(total_year_grade+grades_added);
        await specific_student.save();
      }
      catch (err){
        console.log(err)
      }
    }else{

      let index = list_of_students[i].studentId.totalGrade.length - 1;
      let upgrade_grades2 = total_grades*0.02;  
      let total_year_grade =list_of_students[i].studentId.totalGrade[index];

      if (total_year_grade < total_grades *0.65){
        let diff = total_grades*0.65 - total_year_grade;
        if (upgrade_grades2 > diff){
          total_year_grade = total_grades*0.65;
        }
      }
      else if (total_year_grade < total_grades *0.75){
        let diff = total_grades*0.75 - total_year_grade;
        if (upgrade_grades2 > diff){
          total_year_grade = total_grades*0.75;
        }
      }else{
        let diff = total_grades*0.85 - total_year_grade;
        if (upgrade_grades2 > diff){
          total_year_grade = total_grades*0.85;
        }
      }
      
      try{

        let specific_student = await Students.findById(list_of_students[i].studentId._id);
        specific_student.totalGrade.pop();
        specific_student.totalGrade.push(total_year_grade);
        await specific_student.save();
      }
      catch (err){
        console.log(err)
      }
    }

  }
}

//_________________________________ Results _____________________________________
controlRouter.route('/:staffId/:controlId/results/:yearId')
.get(authenticate_control.verifyControl,(req,res,next) =>{
    Year.findById(req.params.yearId)
    .populate({
      path : 'students.studentId',
      populate : {
        path : 'classIDs.classID',
        populate : {
          path : 'courseID'}
      }
    })
    .then((yearInfo)=>{
      console.log(yearInfo)
      let result =results(yearInfo.students);
      
      res.json (result)
    })
})

function results (list_of_students){
  
  let results = {
    excellent: [],
    veryGood:[],
    good:[],
    pass:[],
    fail:[],
    repeat:[]
  }
  
  for (i=0;i<list_of_students.length ;i++){
    let student = {
      name : "",
      results : [],
      totalGrade : 0 
    }
    let classes = list_of_students[i].studentId.classIDs;
    let student_grade = 0;   // total grade of student in a course
    let total_grades = 0;

    student.name= list_of_students[i].studentId.name;
    let failed_courses_count = 0;
    for(y=0;y<classes.length;y++){
      spc_class = classes[y].classID;
      let course_grade = spc_class.courseID.perfGrade + spc_class.courseID.finalGrade;
      total_grades = total_grades + course_grade;
      for (x=0;x<spc_class.students.length;x++){
        
        if (spc_class.students[x].nid == list_of_students[i].studentId.nid){
          student_grade = spc_class.students[x].totalGrade;
          break;
        }
      }
      let percentage = (student_grade / course_grade) *100;
      if (percentage < 50){
        failed_courses_count = failed_courses_count + 1
      }
      courseResult = {
        courseName:spc_class.courseID.name,
        percentage : percentage,
        totalGrade :student_grade
      }

      student.results.push(courseResult);
    }

    let index = list_of_students[i].studentId.totalGrade.length - 1;
    let total_year_grade =list_of_students[i].studentId.totalGrade[index];

    student.totalGrade =total_year_grade;
    if (failed_courses_count > 0){
      if (failed_courses_count >2 ){
        results.repeat.push(student);
      }
      else{
        results.fail.push(student);
      }
    }
    else{
      if (student.totalGrade< total_grades*0.65){
        results.pass.push(student);
      }
      else if(student.totalGrade< total_grades*0.75){
        results.good.push(student);
      }
      else if (student.totalGrade< total_grades*0.85){
        results.veryGood.push(student);
      }
      else{
        results.excellent.push(student);
      }
    }
    
  }
  return results;
}

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
             stu.totalGrade = parseInt(row.grade) + parseInt(row.finalExam);
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
//==============================helpers Function=======================================//
function prettyControlProfile(controlinfo){
  console.log(controlinfo);
  let finalData = {
    controlName : controlinfo.name,
    year :  controlinfo.year,
    yearID : controlinfo.academicYear,
    responsibleData : {
      name : controlinfo.responsibleIDs[0].responsibleID.name,
      username :controlinfo.responsibleIDs[0].responsibleID.username,
      email : controlinfo.responsibleIDs[0].responsibleID.email
     } ,
     departmentData :{
      name : controlinfo.deptID.name
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
          finalExam : element.finalExam,
          totalGrade : element.totalGrade
      }
      arrayofstudents.push(temp);
  });
  
  return arrayofstudents;
  }
  function manipulateCourse(courseID) {
    let course = {
      name : courseID.name,
      perfGrade :courseID.perfGrade, 
      finalGrade : courseID.finalGrade,
     totalGrade : courseID.perfGrade + courseID.finalGrade,
      semester : courseID.semester,
      academicYear : courseID.academicYear
  
    }
   return course;
  }
  function apply2PercentagToPass(students,course){
    students.forEach(element => {
      let percentage = (element.totalGrade/course.totalGrade) * 100;
      element.percentagebefore = percentage;
      if (percentage < 50 && percentage >= 48) {
        element.percentageAfter  = percentage + 2 ;
        element.totalGradeAfter = element.totalGrade + (0.02 * course.totalGrade);
      }
      else  {
        element.percentageAfter  = percentage ;
        element.totalGradeAfter = element.totalGrade;
      }
    })
  }
  function apply2PercentagToUpgrade(students,course) {
    students.forEach(element => {
      let percentage = (element.totalGrade/course.totalGrade) * 100;
      element.percentagebefore = percentage;
      if ((percentage < 65 && percentage >= 63)|| (percentage < 75 && percentage >= 73) || (percentage < 85 && percentage >= 83)) {
        element.totalGradeAfter = element.totalGrade + (0.02 * course.totalGrade);
        element.percentageAfter  = percentage + 2;
      }
      else  {
        element.percentageAfter  = percentage ;
        element.totalGradeAfter = element.totalGrade;
      }
    })
  }
  function saveGradesToStudents(stuClass,stu) {
   stuClass.forEach(element => {
     stu.forEach(stu => {
      if(element.nid == stu.nid) {
        element.totalGrade = stu.totalGradeAfter;
      }
     })
   })
  }
module.exports = controlRouter;

