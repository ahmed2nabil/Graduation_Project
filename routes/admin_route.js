const express    = require('express');
const express    = require('express');
const mongoose   = require('mongoose');
const passport   = require('passport');
const classes    = require('../models/class');
const Courses    = require('../models/course');
const Dept       = require('../models/department');
const Students   = require('../models/student');
var authenticate_admin = require('../authenticate_admin');
const adminroute = express.Router();

adminroute.post('/login',authenticate_admin.isLocalAuthenticated,(req,res) => {
    var token = authenticate_admin.getToken({_id:req.user._id});
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({success: true,userId :req.user._id,adminlId : req.user.adminID, token: token, msg: 'You are successfully logged in!'});
  
})

adminroute.get('/',authenticate_admin.verifyAdmin,(req,res)=>{
    Dept.find({})
    .then(deptData => {
        var departments = deptData.map(function(deptData) { return {dept_id :deptData._id,name :deptData.name}; });

      Students.aggregate([{$group : {_id : "$deptID", num_stu : {$sum : 1}}}])
      .then(stu => {
          Dept.populate(stu,{path :'_id'})
          .then(stupop =>{
              const departmentCount = stupop.map(function(stupop){return{_id : stupop._id._id,name: stupop._id.name,count:stupop.num_stu};});
              departments.forEach(element => {
                  element.count = 0;
                  departmentCount.forEach(ele => {
                      if(element.name == ele.name){
                          element.count = ele.count;
                      }
                  })
              });
              res.statusCode = 200 ;
            res.setHeader('Content-Type', 'application/json');
            res.json({departmentStatistics:departments});
          } )

      },(err) => next(err))
    },(err) => next(err))
    .catch((err) => next(err));
})



// course routes

adminroute.route('/allCourses')
.get(authenticate_admin.verifyAdmin,(req,res,next) => {
  Courses.find({})
  .then(coursesData => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(coursesData);
  })
})
adminroute.route('/course')
.get(authenticate_admin.verifyAdmin,(req,res,next) => {
  Courses.find({deptID : req.body.deptId,_id : req.body.courseId})
  .then(coursesData => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(coursesData);
  })
})
/// create new course
adminroute.post('/course', authenticate_admin.verifyAdmin,(req,res) => {
    const newCourse = new Courses({
        name : req.body.name,
        code : req.body.code,
        deptID:req.body.deptID,
        semester : req.body.semester,
        academicYear : req.body.academicYear,
        perfGrade : req.body.perfGrade,
        finalGrade : req.body.finalGrade
     })
     try{
     Courses.insertMany(newCourse);
     res.status(201).json(newCourse)    }
     catch(err){
         res.status=400,
         res.json({message:err.message})
     }

})
///// update course data
adminroute.put('/course',authenticate_admin.verifyAdmin,(req,res,cb) => {

Courses.findById(req.body.courseId)
.then((course)=>{
    if (req.body.name != null){
        course.name=req.body.name
    }

    if (req.body.code != null){
        course.code =req.body.code
    }
    if (req.body.deptID != null){
        course.deptID =req.body.deptID
    }
    if (req.body.semester != null){
        course.semester =req.body.semester
    }
    if (req.body.academicYear != null){
        course.academicYear = req.body.academicYear
    }
    if (req.body.perfGrade != null){
        course.perfGrade = req.body.perfGrade
    }
    if (req.body.finalGrade != null){
        course.finalGrade = req.body.finalGrade
    }
    try{

        course.save()
        res.json(course)

    }

    catch(err)
    {
        res.status=400
        res.json({message:err.message})
    }})
})
///// delete a student //////
adminroute.delete('/course',authenticate_admin.verifyAdmin,(req,res,next) => {
   Students.findByIdAndRemove(req.body.courseId)
   .then(res.json({message:'course is deleted successfully'})
   ,(err)=>{next(err)})
   })
//////////////////////////////

module.exports=adminroute;