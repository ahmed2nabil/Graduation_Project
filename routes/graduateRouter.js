const express   = require('express');
const mongoose  = require('mongoose');
var passport = require('passport');
var Graduates = require('../models/graduate');
var departments = require('../models/department');


var authenticate = require('../authenticate');
const { response } = require('express');
var authenticate_admin = require('../authenticate_admin');
var authenticate_grad = require('../authenticate_grad');

const graduateRouter = express.Router();
graduateRouter.use(express.json());

///// LOGIN //////
graduateRouter.post('/login',authenticate_grad.isLocalAuthenticated, (req,res) => {
   
        var token = authenticate.getToken({_id:req.user._id});
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: true,userId :req.user._id, token: token, msg: 'You are successfully logged in!'});
 
});

//////// get all  ////////
graduateRouter.get('/',authenticate_admin.verifyAdmin,(req, res,next)=>{   
    
    departments.findById(req.body.deptId)
   .populate('graduates.graduateId')
    .then((dept)=>{
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    const graddata =  getGraduates(dept);
    res.json(graddata);
    },(err)=>next(err))
    .catch((err)=> next(err));
})

function getGraduates(dept){
    let GraduatesOfDepartment=[];
 
dept.graduates.forEach(element=>{
    let graddata =
    {
        name:element.graduateId.name,
        nationalID:element.graduateId.nid,
        email:element.graduateId.email,
        username:element.graduateId.username,
        phone:element.graduateId.phone
    };
    GraduatesOfDepartment.push(graddata)
})
return GraduatesOfDepartment
} 
///// get  graduate profile ////////////
graduateRouter.route('/:graduateId')
.get(authenticate_grad.verifyGraduate,(req,res,next) => {
    if(req.user._id == req.params.graduateId) {
   Graduates.findById(req.params.graduateId)
   .populate({
    path : 'classIDs.classID',
    populate : {
      path : 'courseID'
    }
  })
//    .populate('classIDs.classID')
   .then((graduate) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    const graduateprofile = graduateData(graduate,req.params.graduateId);
    res.json(graduateprofile);
   },(err) => next(err))
   .catch((err) => next(err)); }
   else {
    var err = new Error("you don't have permission to do that");
    err.status = 403;
    return next(err);
   }
})

//////// get a specific graduate by admin //////////
graduateRouter.route('/graduateprofile')
.get(authenticate_admin.verifyAdmin,(req,res,next) => {
    Graduates.findById(req.body.graduateId)
    .populate({
        path: "classIDs.classID",
        populate : {
          path : 'courseID',
          
        }
        
      }) 
    .then((graduate)=>{
        if(graduate.deptID==req.body.deptId)
        {
            let graduateProfile=
            {
                graduateName: graduate.name,
                userName: graduate.username,
                email : graduate.email ,
                phone :  graduate.phone,
                nationalID:  graduate.nid, 
                courses:[]
            };
            graduate.classIDs.forEach(element=>{
                let course = {
                    name : element.classID.courseID.name
                }; 
                graduateProfile.courses.push(course)
              })
            res.json(graduateProfile)
        }
        else
        {
            res.send('graduate is not in this department')
        }
    })

})
/// create new graduate
graduateRouter.post('/', authenticate_admin.verifyAdmin,(req,res) => {
    const newGraduate = new Graduates ({
        name : req.body.name,
        nid : req.body.nid,
        username: req.body.username ,
        email:req.body.email,
        phone:req.body.phone,
        password:req.body.password,
        deptID:req.body.deptID,
     })
     try{
     Graduates.insertMany(newGraduate);
     res.status(201).json(newGraduate)    }
     catch(err){
         res.status=400,
         res.json({message:err.message})
     }

})
///// update graduate data
graduateRouter.put('/',authenticate_admin.verifyAdmin,(req,res,cb) => {
Graduates.findById(req.body.graduateId)
.then((graduate)=>{
    if (req.body.name != null){
        graduate.name=req.body.name
    }

    if (req.body.username != null){
        graduate.username=req.body.username
    }
    if (req.body.nid != null){
        graduate.nid=req.body.nid
    }
    if (req.body.email != null){
        graduate.email=req.body.email
    }
    if (req.body.phone != null){
        graduate.phone=req.body.phone
    }
    try{

        graduate.save()
        res.json(graduate)

    }

    catch(err)
    {
        res.status=400
        res.json({message:err.message})
    }})
})
///// delete a graduate //////
graduateRouter.delete('/',authenticate_admin.verifyAdmin,(req,res,next) => {
    Graduates.findByIdAndRemove(req.body.graduateId)
   .then(res.json({message:'graduate is deleted successfully'})
   ,(err)=>{next(err)})
   })
//////////////////////////////
function graduateData(graduate){
    let graduateProfile=
            {
               graduateName: graduate.name,
                userName: graduate.username,
                email : graduate.email ,
                phone :  graduate.phone,
                nationalID:  graduate.nid, 
                courses:[]
            };
            graduate.classIDs.forEach(element=>{
                let course = {
                    name : element.classID.courseID.name,
                    CoursePerformanceGrade:element.classID.courseID.perfGrade,
                    CourseFinalGrade:element.classID.courseID.finalGrade
                    
                }; 
                element.classID.graduates.forEach(i=>{
                    course.graduatePerformanceGrade=i.grade
                    course.graduateFinalExamGrade=i.finalExam
                    course.graduateTotalGrade=course.graduatePerformanceGrade+ course.graduateFinalExamGrade
                })
                graduateProfile.courses.push(course)
              })
              return graduateProfile
}
  

module.exports = graduateRouter;
