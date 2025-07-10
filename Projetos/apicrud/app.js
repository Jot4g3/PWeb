// CONFIGURAÇÕES

const express = require("express")
const app = express()

// Não esquecer de criar o arquivo .env com a URI (Connection String) do MongoDB e a PORT que o servidor irá rodar.
require("dotenv").config()
const URI = process.env.URI
const PORT = process.env.PORT

const { MongoClient } = require("mongodb");
const BooksDAO = require("./dao/booksDAO");
const UsersDAO = require("./dao/usersDAO");
const client = new MongoClient(URI);
const booksCollection = client.db('library').collection('books');
const usersCollection = client.db('library').collection('users');

app.set("view engine", "ejs")

app.use(express.urlencoded({ extended: true }))

const bcrypt = require("bcrypt")

const session = require('express-session');

// MIDLERARES

app.use(session({
    secret: 'Mateus633MasbuscaiprimeirooreinodeDeuseasuajusticaetodasestascoisasvosseraoacrescentadas',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Em produção, com HTTPS, use 'true'
        maxAge: 1000 * 60 * 60 * 24 // Expira em 24 horas
    }
}));

app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
})

// ROTAS

app.get("/", async (req, res) => {
    const books = await BooksDAO.getAllBooks(booksCollection)

    res.render("index", { books: books })
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
    const result = await BooksDAO.insertBook(booksCollection, doc)
    console.log(book)
    console.log(result)
    res.redirect("/")
})

app.post("/books/delete/:id", async (req, res) => {
    const id = req.params.id

    const result = await BooksDAO.deleteBookById(booksCollection, id)
    console.log(result)

    res.redirect(`/`)
})

// Renderizando a página de Update.
app.get("/books/update/:id", async (req, res) => {
    const book = await BooksDAO.getBookById(booksCollection, req.params.id)
    console.log(book)
    res.render("editbook.ejs", { book: book })
})

app.post("/books/update/:id", async (req, res) => {
    const id = req.params.id
    const book = req.body

    const doc = {
        "title": book.title,
        "author": book.author,
        "bookpublisher": book.bookpublisher,
        "year": book.year,
        "quantity": book.quantity,
        "price": book.price
    }

    const result = await BooksDAO.updateBookById(booksCollection, id, doc)
    res.redirect("/")

})

app.get("/register", (req, res) => {
    res.render("register.ejs")
})

app.post("/register", async (req, res) => {
    const { name, email, password, passwordConfirm } = req.body;

    if (!name || !email || !password || !passwordConfirm) {
        return res.render('register', { error: 'Todos os campos são obrigatórios.' });
    }

    if (password !== passwordConfirm) {
        return res.render('register', { error: 'As senhas não conferem!' });
    }

    const existingUser = await UsersDAO.getUserByEmail(usersCollection, email);
    if (existingUser) {
        return res.render('register', { error: 'Este e-mail já está em uso.' });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
        name: name,
        email: email,
        password: hashedPassword
    };

    await UsersDAO.insertUser(usersCollection, newUser);

    res.redirect("/")
})

app.get('/login', (req, res) => {
    res.render('login', { error: null });
});

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Encontra o usuário pelo e-mail no banco de dados
        const user = await UsersDAO.getUserByEmail(usersCollection, email);

        // 2. Se o usuário não existe, retorna um erro genérico
        if (!user) {
            return res.render('login', { error: 'E-mail ou senha inválidos.' });
        }

        // 3. Compara a senha enviada com a senha HASHED do banco
        const isMatch = await bcrypt.compare(password, user.password);

        // 4. Se a senha não bate, retorna o mesmo erro genérico
        if (!isMatch) {
            return res.render('login', { error: 'E-mail ou senha inválidos.' });
        }

        // 5. SUCESSO! Salva informações do usuário na sessão
        req.session.isLoggedIn = true;
        req.session.userId = user._id;
        req.session.userName = user.name;

        // 6. Redireciona para a página principal
        res.redirect('/');

    } catch (err) {
        console.error(err);
        res.render('login', { error: 'Ocorreu um erro. Tente novamente.' });
    }
});


// ROTA GET: Logout (encerra a sessão)
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/'); // Se der erro, apenas redireciona
        }
        res.clearCookie('connect.sid'); // Limpa o cookie da sessão
        res.redirect('/'); // Redireciona para a página inicial
        res.locals = {};
    });
});

// LISTENING

app.listen(PORT, () => {
    console.log(`Running at port ${PORT}...`)
})

