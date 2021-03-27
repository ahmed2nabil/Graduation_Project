var express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const Student =  require('../models/student');
var router = express.Router();

router.use(bodyParser.json());

/* GET home page. */
router.get('/', function(req, res, next) {
  res.send("Welcome");
});

module.exports = router;
