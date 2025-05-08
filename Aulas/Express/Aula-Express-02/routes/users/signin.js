var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  redirect("http://localhost:3000/signup")
});

module.exports = router;
