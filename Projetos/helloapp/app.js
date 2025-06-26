const express = require("express")
const app = express()

const axios = require ("axios")

app.set("view engine", "ejs")

const PORT = 3000;

const URL_API = "https://ron-swanson-quotes.herokuapp.com/v2/quotes"

app.listen(PORT, ()=>{
    console.log(`Server running on localhost:${PORT}`);
})

app.use(express.urlencoded({ extended: true }))

const API_URL = 'localhost:8000'

app.get("/", (req, res) => {
    var msg = ""
    axios.get(URL_API)
    .then(function (response){
        msg = response.data[0]
    })
    .catch(function (error) {
        console.log(error)
    })
    .finally(function (){
        res.render("index", {msg: msg})
    })
})

