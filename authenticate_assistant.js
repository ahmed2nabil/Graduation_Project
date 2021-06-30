var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var passport = require('passport');
var localStrategy = require('passport-local').Strategy;
var Assistants = require('./models/teachingAssistant');


var config = require('./config');

exports.local = passport.use('assistant-local',new localStrategy(Assistants.authenticate())); //function authenticate supported by passport local -mongooses

//support the session 
passport.serializeUser(Assistants.serializeUser());
passport.deserializeUser(Assistants.deserializeUser());


exports.getToken = function(user) {
    return jwt.sign(user, config.SECRET_KEY,
        {expiresIn: 3600});
};

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.SECRET_KEY;


exports.jwtPassport = passport.use('assistant-jwt',new JwtStrategy(opts,
    (jwt_payload, done) => {
        Assistants.findOne({_id: jwt_payload._id}, (err, user) => {
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

    exports.isLocalAuthenticated = function(req, res, next) {
        passport.authenticate('assistant-local', function(err, user, info) {
            if (err) { return next(err); } //error exception
            // user will be set to false, if not authenticated
            if (!user) {
                res.status(401).json(info); //info contains the error message
            } 
            else {
                req.logIn(user, function() {
                    // do whatever here on successful login
                    next();
                })
            }   
        })(req, res, next);
    }

    exports.isControlResponsible = function(req,res,next) {
        passport.authenticate('assistant-local', function(err, user, info) {
            if (err) { return next(err); } //error exception
            // user will be set to false, if not authenticated
            if (!user) {
                res.status(401).json(info); //info contains the error message
            } 
            else {
                console.log(user);
                if(user.controlID) {
                req.logIn(user, function() {
                    // do whatever here on successful login
                    next();
                })
            } else {
                res.status(403).json({msg:"You don't have permission to do that"});
            }
            }   
        })(req, res, next);
    }
exports.verifyAssistant= passport.authenticate('assistant-jwt', {session: false});    