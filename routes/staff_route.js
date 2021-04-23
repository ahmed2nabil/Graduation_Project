const express = require('express');
const router = express.Router();
const staff= require("../models/staff.js");
const classes= require("../models/class.js");
module.exports = router

//__________________________Dealing With a Class_________________________________________

// Getting class Info
router.get('/:id/class/:class_id',getclass,(req, res)=>{
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
router.post('/:id/class/',getstaff,async (req, res)=>{
  const newclass = new classes ({
     courseCode : req.body.courseCode,
     year  : req.body.year,
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
router.patch('/:id/class/:class_id',getclass ,async (req, res)=>{
  staffid= res.specific_class.staffIDs[0].staffID
  if (req.params.id==staffid)
  {
    
    if (req.body.students!= null)
   {
     res.specific_class.students=req.body.students
    }
 

   try
   {
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
router.delete('/:id/class/:class_id',getstaff ,async (req, res)=>{
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
router.get('/', async(req, res)=>{
    
    try {
        const allstaff = await staff.find()
        res.json(allstaff)
    }
    catch (err){
  
        res.status(500).json({message:err.message})

        }
})



// GETTING ONE Specific Teaching Staff
router.get('/:id',getstaff,(req, res)=>{
    
    res.send(res.specific_staff)
})


// CREATING New Teaching Staff
router.post('/',async (req, res)=>{
    const newstaff = new staff ({
       name : req.body.name,
       id : req.body.id,
       userName: req.body.username ,
       email:req.body.email,
       phone:req.body.phone,
       password:req.body.password,
       deptID:req.body.deptID,
       classes:req.body.classes
    })
    try{
        const newstaff_created = await newstaff.save()
        res.status(201).json(newstaff_created)


    }
    catch(err)
    {
      res.status(400).json({message:err.message})
    }
    
})
// UPDATING Teaching Staff
router.patch('/:id',getstaff ,async (req, res)=>{
 
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
router.delete('/:id',getstaff, async (req, res)=>{
    try{
      await res.specific_staff.remove()
      res.json({message: "Deleted staff member "})
    }
    catch(err){
         
        res.status(500).json({message:err.message})
    }
    
})

//__________________________Middleware_________________________________

//getting staff member  (this is a midelware function) 
async function getstaff (req,res,next){
    let specific_staff
    try{

      specific_staff = await staff.findById(req.params.id)
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