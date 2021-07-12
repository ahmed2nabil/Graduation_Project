const express = require('express');
const Assistants= require("../models/teachingAssistant");
const classes= require("../models/class.js");
const departments= require("../models/department");
var authenticate_admin = require('../authenticate_admin');
var authenticate_assistant = require('../authenticate_assistant');

const assistantRouter = express.Router();
module.exports = assistantRouter

//_________________________________LOGIN_________________________________________________
assistantRouter.post('/login',authenticate_assistant.isLocalAuthenticated, (req,res) => {
    var token = authenticate_assistant.getToken({_id:req.user._id});
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({success: true,userId :req.user._id, token: token, msg: 'You are successfully logged in!'});
  });
  /////get all teaching assistants
 assistantRouter.get('/',authenticate_admin.verifyAdmin,(req, res,next)=>{   
    
    departments.findById(req.body.deptId)
   .populate('teachingassistants.assistantId')
    .then((dept)=>{
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    const assistantdata =  getAssistants(dept);
    res.json(assistantdata);
    },(err)=>next(err))
    .catch((err)=> next(err));
})

function getAssistants(dept){
    let TeachingAssistantsOfDepartment=[];
 
dept.teachingassistants.forEach(element=>{
    let assistantdata =
    {
        name:element.assistantId.name,
        nationalID:element.assistantId.nid,
        email:element.assistantId.email,
        phone:element.assistantId.phone
    };
    TeachingAssistantsOfDepartment.push(assistantdata)
})
return TeachingAssistantsOfDepartment
} 
////get a specific assistant////

assistantRouter.route('/assistantprofile')
.get(authenticate_admin.verifyAdmin,(req,res,next) => {
    Assistants.findById(req.body.assistantId)
    
    .then((assistant)=>{
        if(assistant.deptID==req.body.deptId)
        {
            let assistantProfile=
            {
                TeachingAssistantName: assistant.name,
                email : assistant.email ,
                phone :  assistant.phone,
                nationalID:  assistant.nid, 
            };
        
            res.json(assistantProfile)
        }
        else
        {
            res.send('not in this department')
        }
    })

})

/// create new assistant
assistantRouter.post('/', authenticate_admin.verifyAdmin,(req,res) => {
  const newAssistant = new Assistants ({
      name : req.body.name,
      nid : req.body.nid,
      email:req.body.email,
      phone:req.body.phone,
      deptID:req.body.deptID,
   })
   try{
   Assistants.insertMany(newAssistant);
   res.status(201).json(newAssistant)    }
   catch(err){
       res.status=400,
       res.json({message:err.message})
   }

})
///// update assistant data
assistantRouter.put('/update',authenticate_admin.verifyAdmin,(req,res,cb) => {
Assistants.findById(req.body.assistantId)
.then((assistant)=>{
  if (req.body.name != null){
      assistant.name=req.body.name
  }

  if (req.body.username != null){
      assistant.username=req.body.username
  }
  if (req.body.nid != null){
      assistant.nid=req.body.nid
  }
  if (req.body.email != null){
      assistant.email=req.body.email
  }
  if (req.body.phone != null){
      assistant.phone=req.body.phone
  }
  try{

      assistant.save()
      res.json(assistant)

  }

  catch(err)
  {
      res.status=400
      res.json({message:err.message})
  }})
})
///// delete a assistant //////
assistantRouter.delete('/delete/asssitantId',authenticate_admin.verifyAdmin,(req,res,next) => {
  Assistants.findByIdAndRemove(req.params.assistantId)
 .then(res.json({message:'assistant is deleted successfully'})
 ,(err)=>{next(err)})
 })
//////////////////////////////
