var express = require('express');
const bodyParser = require('body-parser');
var Student = require('../models/student');
var passport = require('passport');

var router = express.Router();
router.use(bodyParser.json());
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/signup',function(req, res, next){
//to see if one of the existing user is matched with the new username
console.log(req.body);
 Student.register(new Student({username : req.body.username}), 
      req.body.password, (err, user) => {   
    if(err) {
      res.statusCode = 500;
      res.setHeader('Content-Type','application/json');
      res.json({err: err});
    }else {
      passport.authenticate('local')(req,res,()=>{

        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json({success : true,status : 'Registeration Succesful'});
      });

    }
  })

});

router.post('/login',passport.authenticate('local'), (req,res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type','application/json');
  res.json({success : true,status : 'You are succesfully logged in'});
});

router.get('/logout', (req,res) => {
  if(req.session) {
    req.session.destroy();
    //asking the client to delete the cookie
    res.clearCookie('session-id');
    res.redirect('/');
  } else {
    var err = new Error('You are not logged in');
    res.statusCode = 403;
    next(err);
  }

});
module.exports = router;
