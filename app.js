const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
var session = require('express-session');
var fileStore = require('session-file-store')(session);
const bodyParser = require('body-parser');
const config = require('./config');
const app = express();

const port = process.env.PORT || 3000;
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

app.use(session({
  name : 'session-id',
  secret : 'hello-world!!',
  saveUninitialized : false,
  resave: false,
  store: new fileStore()
}));

app.use(passport.initialize());
app.use(passport.session());


app.use('/', indexRouter);
app.use('/users',userRouter);
app.use('/student',studentRouter);


app.listen(port,function(req,res){
    console.log('Server is connected successfully');
});