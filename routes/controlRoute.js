const express   = require('express');
const mongoose  = require('mongoose');
const passport  = require('passport');
const { Parser } = require('json2csv');
const Staff     = require('../models/staff');
const Control   = require('../models/control');
const ControlRules = require('../models/controlRules');
const Class     = require('../models/class');
const Students     = require('../models/student');

const authenticate_control = require('../authenticate_control');
const control = require('../models/control');
const { authenticate } = require('passport');
const staff = require('../models/staff');
const controlRouter = express.Router();
controlRouter.use(express.json());

controlRouter.get('/',(req,res) => {
res.status(200).json({msg:'This is Control module'});
})

controlRouter.post('/login',authenticate_control.isControlResponsible,(req,res) => {
    var token = authenticate_control.getToken({_id:req.user._id});
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({success: true,userId :req.user._id,controlId : req.user.controlID, token: token, msg: 'You are successfully logged in!'});
  
})


controlRouter.route('/:staffId/rules')
.get(authenticate_control.verifyControl,(req,res,next) =>{
    ControlRules.find({})
    .then((rules) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(rules);
    },(err) => next(err)) 
    .catch((err)=> next(err));
})

controlRouter.route('/:staffId/:controlId/students')
.get(authenticate_control.verifyControl,(req,res,next) =>{
    Control.findById(req.params.controlId)
    .populate({
        path : 'classes.classID',
        populate : {
          path : 'students.studentID'
        }
      })
    .then((controlinfo) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        const students = getAllStudentsData(controlinfo);
        res.json(students);
    },(err) => next(err)) 
    .catch((err)=> next(err));
})

controlRouter.route('/:staffId/:controlId/students/csv')
.get(authenticate_control.verifyControl,(req,res,next) =>{
    Control.findById(req.params.controlId)
    .populate({
        path : 'classes.classID',
        populate : {
          path : 'students.studentID'
        }
      })
    .then((controlinfo) => {
        const students = getAllStudentsData(controlinfo);
        try {
            const json2csvParser = new Parser();
            const csv = json2csvParser.parse(students);
            res.attachment('students.csv');
            res.statusCode = 200 ;
            res.setHeader('Content-Type', 'text/csv');
            res.send(csv);
          } catch (err) {
            console.error(err);
            res.status(500).send(error.message)
          }
    },(err) => next(err)) 
    .catch((err)=> next(err));
})
function getAllStudentsData(control) {
const stu = control.classes[0].classID.students ;
let arrayofstudents = [];
stu.forEach(element => {
    let temp = {
        name : element.studentID.name,
        nid : element.nid,
        state : element.state
    }
    arrayofstudents.push(temp);
});

return arrayofstudents;
}
module.exports = controlRouter;