var passport = require('passport');
var localStrategy = require('passport-local').Strategy;
var Student = require('./models/student');

exports.local = passport.use(new localStrategy(Student.authenticate())); //function authenticate supported by passport local -mongooses

//support the session 
passport.serializeUser(Student.serializeUser());
passport.deserializeUser(Student.deserializeUser());