var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('characters', {title: 'Nome do Personagem', nameCharacter: 'Nome do Personagem', shortDescriptionCharacter: 'Curta descrição do Personagem', longDescriptionCharacter: 'Longa descrição do Personagem Longa descrição do Personagem Longa descrição do Personagem Longa descrição do Personagem Longa descrição do Personagem Longa descrição do Personagem Longa descrição do Personagem Longa descrição do Personagem Longa descrição do Personagem Longa descrição do Personagem Longa descrição do Personagem Longa descrição do Personagem Longa descrição do Personagem Longa descrição do Personagem Longa descrição do Personagem Longa descrição do Personagem Longa descrição do Personagem', historyCharacter: 'História do Personagem História do Personagem História do Personagem História do Personagem História do Personagem História do Personagem História do Personagem História do Personagem História do Personagem História do Personagem História do Personagem História do Personagem História do Personagem História do Personagem História do Personagem História do Personagem História do Personagem', bibleCharacter: 'Referência Bíblica: XX'});
});

module.exports = router;
