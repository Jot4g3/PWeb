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
  console.error(`Imagem falhou ao carregar: ${imageElement.src}. Removendo item.`);

  const itemToRemove = imageElement.closest('.carousel-item');
  const carousel = document.getElementById('carouselExample');

  // Se não encontrar os elementos necessários, interrompe a função.
  if (!itemToRemove || !carousel) {
    return;
  }

  const isItemActive = itemToRemove.classList.contains('active');

  // Se o item a ser removido estiver ativo, precisamos encontrar um substituto.
  if (isItemActive) {
    // Tenta pegar o próximo item na lista.
    let nextActiveItem = itemToRemove.nextElementSibling;

    // Se não houver próximo (era o último), o "próximo" é o primeiro da lista.
    if (!nextActiveItem) {
      nextActiveItem = carousel.querySelector('.carousel-item:first-child');
    }

    // Ativa o novo item, mas só se ele não for o próprio item que estamos removendo.
    if (nextActiveItem && nextActiveItem !== itemToRemove) {
      nextActiveItem.classList.add('active');
    }
  }

  // Finalmente, remove o item com a imagem quebrada.
  itemToRemove.remove();

  // BÔNUS: Verifica se o carrossel ficou vazio.
  const remainingItems = carousel.querySelectorAll('.carousel-item').length;
  if (remainingItems === 0) {
    console.warn("O carrossel está vazio. Escondendo o componente.");
    // Encontra o container principal (incluindo as setas) e o esconde.
    const carouselContainer = carousel.closest('.d-flex.align-items-center.gap-4');
    if (carouselContainer) {
      carouselContainer.style.display = 'none';
    }
  }
}