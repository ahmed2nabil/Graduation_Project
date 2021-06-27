var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var passport = require('passport');
var localStrategy = require('passport-local').Strategy;
var admin = require('./models/it_admin');

var config = require('./config');

exports.local = passport.use('admin-local',new localStrategy(admin.authenticate())); //function authenticate supported by passport local -mongooses
//support the session 
passport.serializeUser(admin.serializeUser());
passport.deserializeUser(admin.deserializeUser());

exports.getToken = function(user) {
    return jwt.sign(user, config.SECRET_KEY,
        {expiresIn: 3600});
};

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.SECRET_KEY;




exports.jwtPassport = passport.use('admin-jwt',new JwtStrategy(opts,
    (jwt_payload, done) => {
        admin.findOne({_id: jwt_payload._id}, (err, user) => {
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
        passport.authenticate('admin-local', function(err, user, info) {
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
exports.verifyAdmin = passport.authenticate('admin-jwt', {session: false});