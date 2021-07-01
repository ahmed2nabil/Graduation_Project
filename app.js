const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const config = require('./config');
const cors = require('cors'); 
const app = express();

// app.use(express.json());
const port = process.env.PORT || 3000;
var authenticate = require('./authenticate');
var authenticate_staff = require('./authenticate_staff');
//Routes 
var indexRouter = require('./routes/index');
var userRouter = require('./routes/usersRouter');
var studentRouter = require("./routes/studentRouter");
var staff_route = require("./routes/staff_route")
var class_route = require("./routes/class_route")
var graduateRouter = require("./routes/graduateRouter");
var controlRouter = require("./routes/controlRoute");
var adminRouter = require("./routes/admin_route");



// const Students = require('./models/student'); 
//GkQST3kALV93p35V //
// const url = 'mongodb://localhost:27017/sysboard';
const connect = mongoose.connect(config.MONGO_URI,
  {
    useNewUrlParser : true,
    useUnifiedTopology : true
  });

connect.then((db) => {
console.log('Connected correctly to database');
},(err) => {
  console.log(err);
});

app.use(passport.initialize());
app.use(cors());
app.use('/api/', indexRouter);
app.use('/api/users',userRouter);
app.use('/api/student',studentRouter);
app.use('/api/staff',staff_route);
app.use('/api/class',class_route);
app.use('/api/graduates',graduateRouter);
app.use('/api/control',controlRouter);
app.use('/api/admin',adminRouter)
//Handle production 
if(process.env.NODE_ENV === "production"){
  //for static folder
  app.use(express.static(__dirname + '/public/'));

  //handle single page app 
  app.get(/.*/ ,(req,res) => {
    res.sendFile(__dirname +'/public/index.html');
  }); //get all routes..refer to any route at all  
}
app.listen(port,function(req,res){
    console.log('Server is connected successfully');
});


