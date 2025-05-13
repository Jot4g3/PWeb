var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/:userid', function(req, res) {
  res.send(`Seja bem-vindo, ${req.params.userid}`);
});

module.exports = router;
