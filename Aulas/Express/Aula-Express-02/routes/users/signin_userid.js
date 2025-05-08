var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send(`Seja bem-vindo, ${req.params.userid}`);
});

module.exports = router;
