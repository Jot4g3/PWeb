var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res) {
  res.render('about', { name: 'João Gabriel', github: 'https://github.com/Jot4g3', scriptName: "about"});
});

module.exports = router;
