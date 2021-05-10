var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var passport = require('passport');
var localStrategy = require('passport-local').Strategy;
var Staff = require('./models/staff');



var config = require('./config');

exports.local = passport.use('control-local',new localStrategy(Staff.authenticate())); //function authenticate supported by passport local -mongooses



//support the session 
passport.serializeUser(Staff.serializeUser());
passport.deserializeUser(Staff.deserializeUser());


exports.getToken = function(user) {
    return jwt.sign(user, config.SECRET_KEY,
        {expiresIn: 3600});
};

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.SECRET_KEY;


exports.jwtPassport = passport.use('control-jwt',new JwtStrategy(opts,
    (jwt_payload, done) => {
        Staff.findOne({_id: jwt_payload._id}, (err, user) => {
            if (err) {
                return done(err, false);
            }
            else if (user) {
                if(user.controlID) {
                return done(null, user); 
                }
                else {
                    return done(null,false);
                }
            }
            else {
                return done(null, false);
            }
        });
    }));

    
    exports.isControlResponsible = function(req,res,next) {
        passport.authenticate('control-local', function(err, user, info) {
            if (err) { return next(err); } //error exception
            // user will be set to false, if not authenticated
            if (!user) {
                res.status(401).json(info); //info contains the error message
            } 
            else {
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
exports.verifyControl = passport.authenticate('control-jwt', {session: false});    