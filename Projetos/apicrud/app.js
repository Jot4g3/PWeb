const express = require("express")
const app = express()

// Não esquecer de criar o arquivo .env com a URI (Connection String) do MongoDB e a PORT que o servidor irá rodar.
require("dotenv").config()
const URI = process.env.URI
const PORT = process.env.PORT

const { MongoClient } = require("mongodb");
const BooksDAO = require("./dao");
const client = new MongoClient(URI);
const db = client.db('library').collection('books');

app.set("view engine", "ejs")

app.use(express.urlencoded({extended: true}))

app.get("/", (req, res) => {
    res.render("index")
})

app.post("/books", async (req, res) => {
    const book = req.body

    const doc = {
        "title": book.title,
        "author": book.author,
        "bookpublisher": book.bookpublisher,
        "year": book.year,
        "quantity": book.quantity,
        "price": book.price
    }

    // Enviando pro DB
    const result = await BooksDAO.insertBook(db, doc)
    res.json(result)
    console.log(book)
})

app.listen(PORT, () => {
    console.log(`Running at port ${PORT}...`)
})