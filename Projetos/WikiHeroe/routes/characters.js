var express = require('express');
var router = express.Router();
const path = require('path');
const fs = require('fs'); // Para ler o arquivo JSON


const charactersFilePath = path.join(__dirname, '../data', 'characters.json');
let allCharactersData = [];

// Tentando carregar os dados dos personagens uma vez ao ligar o servidor.
try {
  allCharactersData = JSON.parse(fs.readFileSync(charactersFilePath, 'utf8'));
} catch (error) {
  console.error("Erro ao carregar dados dos personagens:", error);
  // Se o arquivo não existir ou estiver mal formatado, a lista ficará vazia.
  // Tentar ver isso melhor depois.
}

/* GET home page. */

// Pegando o id do personagem pela rota.
router.get('/:id', function (req, res, next) {

  const characterId = req.params.id;
  // Filtrando a lista de personagens e pegando só o personagem em questão.
  const character = allCharactersData.find(char => char.id === characterId);

  if(character){
    res.render('characters', 
      
    {
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

module.exports = router;
