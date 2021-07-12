const express = require('express');
const staff= require("../models/staff.js");
const classes= require("../models/class.js");
const departments= require("../models/department");
var authenticate_admin = require('../authenticate_admin');
var authenticate_staff = require('../authenticate_staff');
const courses = require('../models/course.js');
const students = require('../models/student.js');
const router = express.Router();
module.exports = router

//_________________________________LOGIN_________________________________________________
router.post('/login',authenticate_staff.isLocalAuthenticated, (req,res) => {
  var token = authenticate_staff.getToken({_id:req.user._id});
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({success: true,userId :req.user._id, token: token, msg: 'You are successfully logged in!'});
});
//__________________________Dealing With a Class_________________________________________

// Getting class Info
router.get('/:id/class/:class_id',authenticate_staff.verifyStaff,getclass,(req, res)=>{
  staffid= res.specific_class.staffIDs[0].staffID.toString();
  reqstaffid=req.params.id.toString();
  if (reqstaffid===staffid)
  {
    res.send(res.specific_class)

  }  
  else{
    res.send("You don't have control of this Class" )
  }
})


// Creating a New class and Updating Class array inseide staff data
router.post('/:id/class/',authenticate_staff.verifyStaff,getstaff,async (req, res)=>{
  const newclass = new classes ({
     courseCode : req.body.courseCode,
     year : req.body.year,
     staffIDs: req.body.staffIDs ,
     courseID:req.body.courseID,
     students:req.body.students,
     

  })
  try{
      const newclass_created = await newclass.save()
      newclassID= newclass_created._id

      res.status(201).json(newclass_created)


  }
  catch(err)
  {
    res.status(400).json({message:err.message})
  }
  

    // adding the new class id to the staff classes array
      classesarray=res.specific_staff.classes
      newcourseobj ={classID:newclassID}
      classesarray.push(newcourseobj)

      res.specific_staff.classes=classesarray
    try{

        await res.specific_staff.save()
        

    }

    catch(err)
    {
        console.log("this error in adding the class to array of classes " + err)
    }
    
})

//Updating Student Grades
router.patch('/:id/class/:class_id',authenticate_staff.verifyStaff,getclass ,async (req, res)=>{
  staffid= res.specific_class.staffIDs[0].staffID
  if (req.params.id==staffid)
  {
    studentsdata = res.specific_class.students
     
     let nid;
     let grade;
    for (let i =0 ; i <req.body.students.length;i++)
    {
        nid = req.body.students[i].nid
        grade = req.body.students[i].grade
        
        for  (let i = 0;i<studentsdata.length;i++)
        {
          if (nid===studentsdata[i].nid)
          {
            studentsdata[i].grade = grade
            break
          }
        }
    }
    res.specific_class.students=studentsdata
    try{

      const updatedclass = await res.specific_class.save()
      res.json(updatedclass)

  }

  catch(err)
  {
      res.status(400).json({message:err.message})
  }

    
  }
  
 
   
  else{
    res.send("You don't have control of this Class" )
  }
})

// Delet Class : it just remove class id form staff classes array but not delet it in database 
router.delete('/:id/class/:class_id',authenticate_staff.verifyStaff,getstaff ,async (req, res)=>{
      classesarray = res.specific_staff.classes

      let classindex = -1
      for (let i =0 ; i <classesarray.length;i++)
      {
        if (classesarray[i].classID==req.params.class_id)
        {
          classindex=i
          break
        }
      }
      classesarray.splice(classindex,1)

      res.specific_staff.classes=classesarray

      try{

        await res.specific_staff.save()
        res.json({message: "Class Removed "})

    }

    catch(err)
    {
        console.log("this error in deleting the class to array of classes " + err)
    }

    

})

//________________________________ Class Midelware__________________________
//getting Class  (this is a midelware function) 
async function getclass (req,res,next){
  let specific_class
  try{
  
    specific_class = await classes.findById(req.params.class_id)
    if (specific_class==null)
    {
        res.status(404).json({message:" Classs not found "})
    } 
  
  }
  catch (err)
  {
    
      res.status(500).json({message:err.message})
  }
  res.specific_class=specific_class
  next()
  }

//_________________________________Staff Route_________________________________________

// Getting ALL Teaching Staff
router.post('/all',authenticate_admin.verifyAdmin,(req, res,next)=>{   
    
        departments.findById(req.body.deptId)
       .populate('staff.staffId')
        .then((dept)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        const staffDa =  getStaff(dept);
        console.log(dept);
        res.json(staffDa);
        },(err)=>next(err))
        .catch((err)=> next(err));
})

 function getStaff(dept){
   let staffDa =
  {
    StaffOfDepartment:[]
  }
  let i=0; 
dept.staff.forEach(element=>{
  staffDa.StaffOfDepartment[i]=element.staffId.name
  i++;
  }
  
)
return staffDa
} 

// GETTING ONE Specific Teaching Staff
 router.post('/staffprofile',authenticate_admin.verifyAdmin,getstaff,(req, res)=>{
  
    res.send(staffData(res.specific_staff))
  
}) 

// GETTING Teaching Staff profile
router.get('/:staffId',authenticate_staff.verifyStaff,(req, res,next)=>{
  if(req.user._id == req.params.staffId) {
    staff.findById(req.params.staffId)
    .populate({
      path : 'classes.classID',
      populate : {
        path : 'courseID'
      }
    })
    .then((sta)=> {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      const stData =staffData(sta);
      res.json(stData);
    })
    .catch((err)=>next(err));
  }
  else {
    var err = new Error("you don't have permission to do that");
    err.status = 403;
    return next(err);
  }

}) 
// Modifi Staff Data
function  staffData(staffdata) {
  let data = {
      name: staffdata.name,
      username: staffdata.username,
      email : staffdata.email ,
      phone : staffdata.phone,
      ID : staffdata.id,
      deptID:staffdata.deptID,
      classes :[]

  };
  for (let i =0;i<staffdata.classes.length;i++)
  {
    let classinfo = {
      classID:"",
      courseName : "",
      couseCode:""
  
    }
     classinfo.classID = staffdata.classes[i].classID._id
     classinfo.courseName = staffdata.classes[i].classID.courseID.name
     classinfo.couseCode = staffdata.classes[i].classID.courseCode

     data.classes.push(classinfo)
     
  } 

  
return data;
}

// CREATING New Teaching Staff
router.post('/',authenticate_admin.verifyAdmin,async (req, res)=>{
    const newstaff = new staff ({
       name : req.body.name,
       id : req.body.id,
       username: req.body.username ,
       email:req.body.email,
       phone:req.body.phone,
       deptID:req.body.deptID,
    })
    try{
      staff.register(newstaff,req.body.password);
      res.status(201).json(newstaff)    }
      catch(err){
          res.status=400,
          res.json({message:err.message})
      }
})
// UPDATING Teaching Staff
router.put('/update',authenticate_admin.verifyAdmin,getstaff ,async (req, res)=>{
 
    if (req.body.name != null)
    {
      res.specific_staff.name = req.body.name
    }
    if (req.body.id != null)
    {
      res.specific_staff.id=req.body.id
    }
    if (req.body.username != null)
    {
      res.specific_staff.userName=req.body.username
    }
    if (req.body.email!= null)
    {
      res.specific_staff.email=req.body.email
    }
    if (req.body.phone!= null)
    {
      res.specific_staff.phone=req.body.phone
    }
    if (req.body.password!= null)
    {
      res.specific_staff.password=req.body.password
    }
    if (req.body.deptID!= null)
    {
      res.specific_staff.deptID=req.body.deptID
    }
    if (req.body.classes!= null)
    {
      res.specific_staff.classes=req.body.classes
    }
    try{

        const updatedstaff = await res.specific_staff.save()
        res.json(updatedstaff)

    }

    catch(err)
    {
        res.status(400).json({message:err.message})
    }
    
})
// DELETING Teaching Staff
router.delete('/delete/:staffId',authenticate_admin.verifyAdmin,getstaff, async (req, res)=>{
  staff.findByIdAndRemove(req.params.staffId)
  .then(res.json({message:'student is deleted successfully'})
  ,(err)=>{next(err)})
})

//__________________________Middleware_________________________________

//getting staff member  (this is a midelware function) 
async function getstaff (req,res,next){
    let specific_staff
    try{
      if(req.body.deptId)
      {
      specific_staff = await staff.findById(req.body.staffId)
       .populate({
        path: "classes.classID",
        populate : {
          path : 'courseID',
          
        }
        
      })
    }
      if (specific_staff==null)
      {
          res.status(404).json({message:" Staff member not found "})
      } 

    }
    catch (err)
    {
      
        res.status(500).json({message:err.message})
    }
    res.specific_staff=specific_staff
    next()
}

//_____________________________ end of staff Route _________________________________________
