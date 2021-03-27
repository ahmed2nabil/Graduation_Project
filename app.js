const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const bodyParser = require('body-parser');
const config = require('./config');
const app = express();

var authenticate = require('./authenticate');
//Routes 
var indexRouter = require('./routes/index');
var userRouter = require('./routes/usersRouter');
var studentRouter = require("./routes/studentRouter");

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
app.use(passport.session());


app.use('/', indexRouter);
app.use('/users',userRouter);

function auth(req,res,next){
  console.log(req.user);
  if(!req.user){  //make sure of cookies exists
      var err = new Error("you are not authenticated!");
      err.status = 403;
      return next(err);
  }
  else {
      next();
  }
}
app.use(auth);

app.use('/student',studentRouter);


app.listen(3000,function(req,res){
    console.log('Server is connected successfully');
});