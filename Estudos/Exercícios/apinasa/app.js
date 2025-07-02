const axios = require("axios") // Faz requisições HTTP
const express = require("express") // Cria servidor web
const app = express()
require('dotenv').config() // Carrega variáveis do .env
const API_KEY = process.env.API_KEY

if (!API_KEY) {
  console.error("ERRO: A chave da API da NASA não está definida. Certifique-se de ter um arquivo .env com NASA_API_KEY=SUA_CHAVE_AQUI.");
}

const PORT = 3000

app.set("view engine", "ejs")

const today = new Date();

const year = today.getFullYear();
let year_foruse = year
const month = String(today.getMonth() + 1).padStart(2, '0'); // Colocando o padStart para o 5 virar 05, por exemplo. +1 porque começa do zero!
let month_foruse = month
if (month - 1 == 0) {
  month_foruse = String(12).padStart(2, "0")
  year_foruse = String(year - 1).padStart(2, "0")
}
const day = String(today.getDate()).padStart(2, '0');

console.log(`Hoje é: ${day}/${month}/${year}`);

app.use(express.urlencoded({ extended: true }))

app.get("/", (req, res) => {
  const astro = req.query.astro
  axios.get(`https://api.nasa.gov/planetary/apod?api_key=${API_KEY}&start_date=${year_foruse}-${String(parseInt(month_foruse) - 5).padStart(2, '0')}-${day}&end_date=${year}-${month}-${day}`)
    .then(function (response) {
      const filteredData = response.data.filter(image =>
        image.copyright == null && image.explanation.includes(astro)
      );
      const dataToSend = filteredData.length > 0 ? filteredData : response.data;

      res.render("index", { data: dataToSend })
      console.log(response.data)
    })
    .catch(function (error) {
      console.log(error);
    })
})

app.listen(PORT, () => {
  console.log("Running at port " + PORT)
})

// Função para caso a img não carregue. By Geminy.
function handleImageError(imageElement) {
  console.warn("Imagem falhou ao carregar. Removendo item do carrossel.", imageElement.src);

  // 1. Encontra o elemento 'carousel-item' mais próximo da imagem que falhou.
  const itemToRemove = imageElement.closest('.carousel-item');

  if (itemToRemove) {
    // 2. Verifica se o item a ser removido é o que está 'ativo'.
    if (itemToRemove.classList.contains('active')) {
      // Se for, passa a classe 'active' para o próximo item.
      const nextItem = itemToRemove.nextElementSibling;
      if (nextItem) {
        nextItem.classList.add('active');
      } else {
        // Se não houver próximo (era o último), tenta ativar o primeiro.
        const parent = itemToRemove.parentElement;
        if (parent && parent.firstElementChild) {
          parent.firstElementChild.classList.add('active');
        }
      }
    }

    // 3. Remove o item com a imagem quebrada do carrossel.
    itemToRemove.remove();
  }
}