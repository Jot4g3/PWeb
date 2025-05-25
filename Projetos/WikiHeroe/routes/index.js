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
router.get('/', function (req, res, next) {
  res.render('index', { 
    title: "WikiHeroe - Home",
    charactersList: allCharactersData
  });
});

module.exports = router;
