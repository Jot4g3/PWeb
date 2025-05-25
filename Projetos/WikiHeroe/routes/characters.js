var express = require('express');
var router = express.Router();

let allCharactersData = require('../data/characters.json');

/* GET home page. */

/* Rota para a lista de personagens (URL: /characters) */
router.get('/', function (req, res, next){
  res.render('characters_list', 
    
    {
      title: 'Lista de Personagens',
    }

  );
});

// Pegando o id do personagem pela rota.
router.get('/:id', function (req, res, next) {

  let characterId = req.params.id;
  characterId = formatText(characterId);
  // Filtrando a lista de personagens e pegando só o personagem em questão.
  const character = allCharactersData.find(char => char.id === characterId);

  if(character){
    res.render('characters', 
      
    {
      selected: characterId,
      charactersList: allCharactersData,
      title: character.nameCharacter,
      nameCharacter: character.nameCharacter,
      shortDescriptionCharacter: character.shortDescriptionCharacter,
      longDescriptionCharacter: character.longDescriptionCharacter,
      historyCharacter: character.historyCharacter,
      bibleCharacter: character.bibleCharacter
    }
    
    );
  } else {
    // Se o personagem não for encontrado, encaminha para um erro 404
    const err = new Error('Personagem não encontrado');
    err.status = 404;
    next(err); // Deixa o middleware de erro do Express Generator lidar com isso :D
  }

});

function formatText(str) {
  return str
    .normalize("NFD") // Decompor caracteres acentuados em seus componentes base e diacríticos
    .replace(/[\u0300-\u036f]/g, "") // Remover os diacríticos (acentos)
    .toLowerCase() // Converter para minúsculas
    .replace(/[^a-z0-9\s]/g, ""); // Remover símbolos, mantendo apenas letras, números e espaços
}

module.exports = router;
