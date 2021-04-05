var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var passport = require('passport');
var localStrategy = require('passport-local').Strategy;
var Student = require('./models/student');


var config = require('./config');

exports.local = passport.use(new localStrategy(Student.authenticate())); //function authenticate supported by passport local -mongooses
//support the session 
passport.serializeUser(Student.serializeUser());
passport.deserializeUser(Student.deserializeUser());

exports.getToken = function(user) {
    return jwt.sign(user, config.SECRET_KEY,
        {expiresIn: 3600});
};

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.SECRET_KEY;




exports.jwtPassport = passport.use(new JwtStrategy(opts,
    (jwt_payload, done) => {
        console.log("JWT payload: ", jwt_payload);
        Student.findOne({_id: jwt_payload._id}, (err, user) => {
            if (err) {
                return done(err, false);
            }
            else if (user) {
                return done(null, user);
            }
            else {
                return done(null, false);
            }
        });
    }));

exports.verifyStudent = passport.authenticate('jwt', {session: false});