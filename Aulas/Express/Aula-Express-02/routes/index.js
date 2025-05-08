var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Root' , paragraph: 'Atividade 03 de Aula-07'});
});

module.exports = router;
