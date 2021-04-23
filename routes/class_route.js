const express = require('express');
const router = express.Router();
const classes = require("../models/class.js");
module.exports = router

//____________________________Class Route__________________________________

// Getting ALL Classes
router.get('/', async(req, res)=>{
    
    try {
        const allClasses = await classes.find()
        res.json(allClasses)
    }
    catch (err){
  
        res.status(500).json({message:err.message})

        }
})

// GETTING ONE Specific Class
router.get('/:id',getclass,(req, res)=>{
    
    res.send(res.specific_class)
})


// CREATING New class
router.post('/',async (req, res)=>{
    const newclass = new classes ({
       courseCode : req.body.courseCode,
       year  : req.body.year,
       staffIDs: req.body.staffIDs ,
       courseID:req.body.courseID,
       students:req.body.students,
       

    })
    try{
        const newclass_created = await newclass.save()
        res.status(201).json(newclass_created)


    }
    catch(err)
    {
      res.status(400).json({message:err.message})
    }
    
})
// UPDATING Class
router.patch('/:id',getclass ,async (req, res)=>{
 
    if (req.body.courseCode != null)
    {
      res.specific_class.courseCode = req.body.courseCode
    }
    if (req.body.year != null)
    {
      res.specific_class.year= req.body.year
    }
    if (req.body.staffIDs != null)
    {
      res.specific_class.staffIDs=req.body.staffIDs
    }
    if (req.body.courseID!= null)
    {
      res.specific_class.courseID=req.body.courseID
    }
    if (req.body.students!= null)
    {
      res.specific_class.students=req.body.students
    }
   
  
    try{

        const updatedclass = await res.specific_class.save()
        res.json(updatedclass)

    }

    catch(err)
    {
        res.status(400).json({message:err.message})
    }
    
})

// DELETING Class
router.delete('/:id',getclass, async (req, res)=>{
    try{
      await res.specific_class.remove()
      res.json({message: "Deleted Class "})
    }
    catch(err){
         
        res.status(500).json({message:err.message})
    }
    
})

//__________________________Middleware______________________________________
//getting Class  (this is a midelware function) 
async function getclass (req,res,next){
    let specific_class
    try{

      specific_class = await classes.findById(req.params.id)
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

//___________________________End of Class Route________________________________