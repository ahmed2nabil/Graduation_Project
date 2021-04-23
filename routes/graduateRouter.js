const express= require('express');
var graduates = require ('../models/graduate');
var authenticate = require('../authenticate_grad');
const graduateRouter=express.Router();
graduateRouter.use(express.json());

graduateRouter.get('/',(req,res)=> {
    res.send('This is graduates module');
})
graduateRouter.post('/login',authenticate.isLocalAuthenticated,(req,res)=>{
    var token= authenticate.getToken({
        _id:req.user._id
    });
    res.statusCode=200;
    res.setHeader('Content-Type','application/json');
    res.json({
        success:true,
        token:token,
        userId:req.user._id,
        msg:"You are logged in",

    })

});
graduateRouter.route('/:graduateId')
.get(authenticate.verifyGraduate,(req,res,next)=> {
    if(req.user._id == req.params.graduateId) {
    graduates.findById(req.params.graduateId)
    .populate({
        path : 'classIDs.classID',
        populate : {
          path : 'courseID'
        }
      })
.then((graduate)=>{
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    const graduateData= getData(graduate,req.params.graduateId)
    res.json(graduateData);
},
(err)=>next(err))
.catch((err)=> next(err))}
else{
    var err = new Error("you don't have permission to do that");
    err.status = 403;
    return next(err);
}
}
)


function getData(graduate,gradID){
let data ={
    name: graduate.name,
    username: graduate.username,
    email : graduate.email ,
    phone : graduate.phone,
    ID : graduate.id,
    courses :[]
};

//ERROR
let i=0;
graduate.classIDs.forEach(element => {
    console.log(element.classID);
    let course = {
        name : element.classID.courseID.name,
        finalGrade : element.classID.courseID.finalGrade
    }; 
    element.classID.graduates.forEach(element => {
        if(element.graduateID == gradID) {
            console.log(element);
            course.graduateFinalGrade = element.finalExam;
          }
    }); 
         data.courses[i]=course;
         i++;
});





return data;
}
module.exports = graduateRouter;