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
if (month - 1 == 0){
  month_foruse = String(12).padStart(2, "0")
  year_foruse = String(year-1).padStart(2, "0")
}
const day = String(today.getDate()).padStart(2, '0');

console.log(`Hoje é: ${day}/${month}/${year}`);

app.get("/", (req, res) => {
    axios.get(`https://api.nasa.gov/planetary/apod?api_key=${API_KEY}&start_date=${year_foruse}-${String(parseInt(month_foruse) - 1).padStart(2, '0')}-${day}&end_date=${year}-${month}-${day}`)
    .then(function (response) {
        res.render("index", {data: response.data.filter(image => image.copyright == null)})
        console.log(response.data)
      })
      .catch(function (error) {
        console.log(error);
      })
})

app.listen(PORT, () => {
    console.log("Running at port " + PORT)
})