var passport = require('passport');
var localStartegy = require('passport-local').Strategy;
var Student = require('./models/student');

exports.local = passport.use(new localStartegy(Student.authenticate())); //function authenticate supported by passport local -mongooses

//support the session 
passport.serializeUser(Student.serializeUser());
passport.deserializeUser(Student.deserializeUser());