var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/:userid', function (req, res) {
  //req.params.userid
  res.render('signin_userid', {scriptName: "signin", apelido: req.params.userid});
});

module.exports = router;
