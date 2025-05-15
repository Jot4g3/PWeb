var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res) {
  //Antes, na atividade, se não recebesse o parâmetro, userid, redirecionava para a página de signup  
  //res.redirect("/users/signup")
  //Agora, estou fazendo a página de signin, que é a página de login
  res.render('signin', {scriptName: "signin"});
  //OBS.: Todos os scripts devem estar na pasta /public/js!
});

module.exports = router;
