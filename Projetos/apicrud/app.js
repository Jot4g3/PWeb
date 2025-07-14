// ===================================================
// CONFIGURAÇÕES
// ===================================================
const express = require("express");
const app = express();
require("dotenv").config();

const { MongoClient, ObjectId } = require("mongodb");
const BooksDAO = require("./dao/booksDAO");
const UsersDAO = require("./dao/usersDAO");
const ReservationsDAO = require("./dao/reservationsDAO");

const bcrypt = require("bcrypt");
const session = require('express-session');
const flash = require('connect-flash');
const MongoStore = require('connect-mongo');

// ===================================================
// VARIÁVEIS DE AMBIENTE
// ===================================================
const URI = process.env.URI;
const PORT = process.env.PORT || 3000; // Define 3000 como porta padrão se não houver no .env
const secretSession = process.env.secretSession

// ===================================================
// MIDDLEWARES
// ===================================================
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); // Para servir arquivos estáticos como CSS, se necessário

app.use(session({
    secret: secretSession, // Ótimo que você já está usando uma variável para isso!
    resave: false,
    saveUninitialized: false,
    
    // A MÁGICA ACONTECE AQUI:
    store: MongoStore.create({
        mongoUrl: URI, // Usa a mesma URI de conexão do seu banco de dados
        dbName: 'library', // O nome do seu banco de dados
        collectionName: 'sessions', // Nome da coleção onde as sessões serão salvas
        ttl: 14 * 24 * 60 * 60 // Tempo de vida da sessão em segundos (opcional, aqui 14 dias)
    }),

    cookie: {
        secure: false, // Em produção (com HTTPS), mude para true
        maxAge: 1000 * 60 * 60 * 24 // 1 dia, para o cookie do navegador
    }
}));

app.use(flash());

// CORREÇÃO: Middleware único e otimizado
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.session = req.session;
    next();
});

// ============================================================
// FUNÇÃO PRINCIPAL PARA CONECTAR AO BANCO E INICIAR O SERVIDOR
// ============================================================
async function main() {
    const client = new MongoClient(URI);
    try {
        // CORREÇÃO: Conectar ao cliente do MongoDB
        await client.connect();
        console.log("Conectado ao MongoDB com sucesso!");

        // Define as coleções que serão usadas nas rotas
        const booksCollection = client.db('library').collection('books');
        const usersCollection = client.db('library').collection('users');
        const reservationsCollection = client.db('library').collection('reservations');

        // ===================================================
        // ROTAS
        // ===================================================

        app.get('/', async (req, res) => {
            try {
                const books = await BooksDAO.getAllBooks(booksCollection);
                let userReservations = new Set(); // Inicia como um Set vazio

                if (req.session.isLoggedIn) {
                    const reservations = await reservationsCollection.find({
                        userId: new ObjectId(req.session.userId)
                    }).toArray();
                    userReservations = new Set(reservations.map(reservation => reservation.bookId.toString()));
                }

                res.render('index', {
                    books: books,
                    isLoggedIn: req.session.isLoggedIn || false, // Redundante!
                    isLibrarian: req.session.isLibrarian || false, // Redundante!
                    booksReserved: userReservations
                });
            } catch (err) {
                console.log("Erro ao buscar livros para a página inicial:", err);
                req.flash('error_msg', 'Não foi possível carregar os livros.');
                res.render('index', { books: [], booksReserved: new Set() });
            }
        });

        // ROTAS DE LIVROS
        app.post("/books", async (req, res) => {
            if (!req.session.isLibrarian) {
                req.flash('error_msg', 'Apenas bibliotecários podem cadastrar livros.');
                return res.redirect('/');
            }
            try {
                const book = req.body;
                const doc = {
                    title: book.title,
                    author: book.author,
                    bookpublisher: book.bookpublisher,
                    year: parseInt(book.year),
                    quantity: parseInt(book.quantity),
                    price: parseFloat(book.price),
                    qttReserved: 0, // Inicia com 0
                    createdBy: new ObjectId(req.session.userId)
                };
                await BooksDAO.insertBook(booksCollection, doc);
                req.flash('success_msg', 'Livro cadastrado com sucesso!');
                res.redirect("/");
            } catch (err) {
                req.flash('error_msg', 'Erro ao cadastrar livro.');
                res.redirect('/');
            }
        });

        app.post("/books/delete/:id", async (req, res) => {
            if (!req.session.isLibrarian) return res.redirect('/');
            const id = req.params.id;
            await BooksDAO.deleteBookById(booksCollection, id);
            req.flash('success_msg', 'Livro excluído com sucesso.');
            res.redirect(`/`);
        });

        app.get("/books/update/:id", async (req, res) => {
            if (!req.session.isLibrarian) return res.redirect('/');
            const book = await BooksDAO.getBookById(booksCollection, req.params.id);
            res.render("editbook.ejs", { book: book });
        });

        app.post("/books/update/:id", async (req, res) => {
            if (!req.session.isLibrarian) return res.redirect('/');
            const id = req.params.id;
            const book = req.body;
            // CORREÇÃO: Lógica de update segura para não apagar campos existentes
            const doc = {
                title: book.title,
                author: book.author,
                bookpublisher: book.bookpublisher,
                year: parseInt(book.year),
                quantity: parseInt(book.quantity),
                price: parseFloat(book.price),
            };
            await BooksDAO.updateBookById(booksCollection, id, doc);
            req.flash('success_msg', 'Livro atualizado com sucesso.');
            res.redirect("/");
        });

        // CORREÇÃO: Rota de reserva única e completa
        app.get('/books/reserve/:bookId', async (req, res) => {
            if (!req.session.isLoggedIn) {
                req.flash('error_msg', 'Você precisa fazer login para reservar um livro.');
                return res.redirect('/login');
            }
            try {
                const bookId = req.params.bookId;
                const userId = req.session.userId;

                const existingReservation = await ReservationsDAO.findReservation(reservationsCollection, userId, bookId);
                if (existingReservation) {
                    try{
                        await ReservationsDAO.deleteReservationByBookID(reservationsCollection, req.params.bookId)
                        req.flash('success_msg', 'A reserva foi cancelada!');
                    } catch (err){
                        console.log(err)
                        req.flash('error_msg', 'Não foi possível cancelar reserva.');
                    } finally {
                        return res.redirect('/');
                    }
                }

                const userReservationCount = await ReservationsDAO.countUserReservations(reservationsCollection, userId);
                if (userReservationCount >= 5) {
                    req.flash('error_msg', 'Você atingiu seu limite de 5 reservas.');
                    return res.redirect('/');
                }

                const book = await BooksDAO.getBookById(booksCollection, bookId);
                if (!book || (book.quantity - book.qttReserved) <= 0) {
                    req.flash('error_msg', 'Não há cópias disponíveis deste livro.');
                    return res.redirect('/');
                }

                const reservationDoc = {
                    userId: new ObjectId(userId),
                    bookId: new ObjectId(bookId),
                    reservationDate: new Date()
                };
                await ReservationsDAO.createReservation(reservationsCollection, reservationDoc);
                await BooksDAO.updateBookById(booksCollection, bookId,  { qttReserved: book.qttReserved + 1 });

                req.flash('success_msg', 'Livro reservado com sucesso!');
                res.redirect('/');
            } catch (err) {
                console.error("Erro no processo de reserva:", err);
                req.flash('error_msg', 'Ocorreu um erro ao processar sua reserva.');
                res.redirect('/');
            }
        });

        // ROTAS DE USUÁRIO (Login/Register/Logout)
        app.get("/register", (req, res) => res.render("register.ejs"));

        app.post("/register", async (req, res) => {
            const { name, email, password, passwordConfirm } = req.body;
            const isLibrarian = req.body.isLibrarian === 'on';

            if (!name || !email || !password || !passwordConfirm) {
                req.flash('error_msg', 'Todos os campos são obrigatórios.');
                return res.render('register.ejs');
            }
            if (password !== passwordConfirm) {
                req.flash('error_msg', 'As senhas não conferem!');
                return res.render('register.ejs');
            }

            const existingUser = await UsersDAO.getUserByEmail(usersCollection, email);
            if (existingUser) {
                req.flash('error_msg', 'Este e-mail já está em uso.');
                return res.render('register.ejs');
            }

            const salt = await bcrypt.genSalt(12);
            const hashedPassword = await bcrypt.hash(password, salt);

            const newUser = { name, email, password: hashedPassword, isLibrarian };
            await UsersDAO.insertUser(usersCollection, newUser);

            req.flash('success_msg', 'Conta criada com sucesso! Faça o login.');
            res.redirect("/login");
        });

        app.get('/login', (req, res) => res.render('login.ejs'));

        app.post('/login', async (req, res) => {
            const { email, password } = req.body;
            const user = await UsersDAO.getUserByEmail(usersCollection, email);
            if (!user) {
                req.flash('error_msg', 'E-mail ou senha inválidos.');
                return res.redirect('/login');
            }
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                req.flash('error_msg', 'E-mail ou senha inválidos.');
                return res.redirect('/login');
            }

            req.session.isLoggedIn = true;
            req.session.userId = user._id;
            req.session.userName = user.name;
            req.session.isLibrarian = user.isLibrarian;

            res.redirect('/');
        });

        app.get('/logout', (req, res) => {
            req.session.destroy(err => {
                if (err) { return res.redirect('/'); }
                res.clearCookie('connect.sid');
                res.redirect('/login');
            });
        });

        // ===================================================
        // INICIAR O SERVIDOR
        // ===================================================
        app.listen(PORT, () => {
            console.log(`Servidor rodando na porta ${PORT}...`);
        });

    } catch (e) {
        console.error("Não foi possível conectar ao banco de dados.", e);
        process.exit(1);
    }
}

// Inicia a aplicação
main().catch(console.error);