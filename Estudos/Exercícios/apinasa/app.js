const axios = require("axios")
const express = require("express")
const app = express()
require('dotenv').config()
const API_KEY = process.env.API_KEY

if (!API_KEY) {
    console.error("ERRO: A chave da API da NASA não está definida. Certifique-se de ter um arquivo .env com NASA_API_KEY=SUA_CHAVE_AQUI.");
}

const PORT = 3000

app.set("view engine", "ejs")

const today = new Date();

const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, '0'); // Mês é 0-indexado, então +1
const day = String(today.getDate()).padStart(2, '0');

console.log(`Hoje é: ${day}/${month}/${year}`);

app.get("/", (req, res) => {
    axios.get(`https://api.nasa.gov/planetary/apod?api_key=${API_KEY}&start_date=${year}-${(month - 1) == 0 ? 12 : (month - 1)}-${day}&end_date=${year}-${month}-${day}`)
    .then(function (response) {
        res.render("index", {data: response.data.filter(image => image.copyright == false)})
        console.log(response.data)
      })
      .catch(function (error) {
        console.log(error);
      })
})

app.listen(PORT, () => {
    console.log("Running at port "+PORT)
})