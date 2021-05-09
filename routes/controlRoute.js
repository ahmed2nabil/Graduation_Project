const express   = require('express');
const express   = require('express');
const mongoose  = require('mongoose');
const passport  = require('passport');
const Staff     = require('../models/staff');
const Control   = require('../models/control')
const Class     = require('../models/class');

const authenticate_staff = require('../authenticate_staff');
const controlRouter = express.Router();
controlRouter.use(express.json());

controlRouter.get('/',(req,res) => {
res.statusCode(200).json({msg:'This is Control module'});
})

controlRouter.post('/login',authenticate_staff.isLocalAuthenticated,(req,res) => {
    
})