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
const LibrariesDAO = require("./dao/librariesDAO");

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
    secret: secretSession,
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

// Middleware para redirecionar bibliotecários sem biblioteca
app.use((req, res, next) => {
    const isLibrarian = req.session.isLibrarian;
    const hasNoLibrary = !req.session.libraryId;
    const allowedPaths = [
        '/login',
        '/register',
        '/logout',
        '/libraries/onboarding', // Pode acessar a própria página
        '/libraries/new',       // Pode acessar a página de criação
        '/libraries/create',    // Pode enviar o formulário de criação
        '/libraries/join'       // Pode enviar o formulário para se juntar
    ];

    // Se ele for um bibliotecário sem biblioteca E não estiver em uma das rotas permitidas...
    if (isLibrarian && hasNoLibrary && !allowedPaths.includes(req.path)) {
        // ...redirecione-o para a página de decisão.
        return res.redirect('/libraries/onboarding');
    }

    next(); // Se não, vida que segue.
});

// CORREÇÃO: Middleware único e otimizado
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.session = req.session;
    next();
});

// ===================================================
// FUNÇÃO HELPER (Auxiliar)
// ===================================================
function generateAccessKey() {
    const datePart = Date.now().toString().slice(-6)
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `BIBL-${datePart}-${randomPart}`;
}

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
        const librariesCollection = client.db('library').collection('libraries');

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
                    userReservations: userReservations
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
                    qttReserved: 0, // Inicia com 0, MAS NÃO DEVERIA SER (PORQUE JÁ PODEM HAVER LIVROS RESERVADOS NO MOMENTO DE CRIAÇÃO DO LIVRO NO BD)
                    createdBy: new ObjectId(req.session.userId),
                    libraryId: new ObjectId(req.session.libraryId)
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

        //Permitir editar apenas se for bibliotecário da biblioteca que postou o livro!!!
        app.get("/books/update/:id", async (req, res) => {
            if (!req.session.isLibrarian) return res.redirect('/');
            const book = await BooksDAO.getBookById(booksCollection, req.params.id);
            res.render("editbook.ejs", { book: book });
        });

        app.post("/books/update/:id", async (req, res) => {
            if (!req.session.isLibrarian) return res.redirect('/');

            const id = req.params.id;
            const book = req.body;
 
            if(book.libraryId != UsersDAO.getUserById(usersCollection, req.session.userId).libraryId){
                req.flash('error_msg', 'Você não pode editar este livro porque não é bibliotecário desta biblioteca');
            }

            if (!book.title || !book.author || !book.bookpublisher || !book.year || !book.quantity || !book.price) {
                req.flash('error_msg', 'Preencha os campos corretamente.');
                return res.redirect("/");
            }
            else if (parseInt(book.quantity) < 0) {
                req.flash('error_msg', 'Não é permitido que a quantidade de livros seja negativa.');
                return res.redirect("/");
            }
            else {
                try {
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
                } catch (err) {
                    console.log(err)
                } finally {
                    req.flash('success_msg', 'Livro atualizado com sucesso.');
                    res.redirect("/");
                }
            }
        });

        // CORREÇÃO: Rota de reserva única e completa
        app.post('/books/reserve/:bookId', async (req, res) => {
            if (!req.session.isLoggedIn) {
                req.flash('error_msg', 'Você precisa fazer login para reservar um livro.');
                return res.redirect('/login');
            }
            try {
                const bookId = req.params.bookId;
                const userId = req.session.userId;

                const existingReservation = await ReservationsDAO.findReservation(reservationsCollection, userId, bookId);
                if (existingReservation) {
                    try {
                        await ReservationsDAO.deleteReservation(reservationsCollection, req.params.bookId, req.session.userId)
                        // Incrementando a quantidade de livros reservados.
                        await BooksDAO.updateBookById(booksCollection, bookId, { qttReserved: book.qttReserved - 1 });
                        req.flash('success_msg', 'A reserva foi cancelada!');
                    } catch (err) {
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
                await BooksDAO.updateBookById(booksCollection, bookId, { qttReserved: book.qttReserved + 1 });

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
            try {
                // 1. Pega os dados do formulário (sem o accessKey)
                const { name, email, password, passwordConfirm } = req.body;
                const isLibrarian = req.body.isLibrarian === 'on';

                // 2. Validações básicas
                if (!name || !email || !password || !passwordConfirm) {
                    req.flash('error_msg', 'Todos os campos são obrigatórios.');
                    return res.redirect('/register');
                }
                if (password !== passwordConfirm) {
                    req.flash('error_msg', 'As senhas não conferem!');
                    return res.redirect('/register');
                }

                // 3. Verifica se o e-mail já existe
                const existingUser = await UsersDAO.getUserByEmail(usersCollection, email);
                if (existingUser) {
                    req.flash('error_msg', 'Este e-mail já está em uso.');
                    return res.redirect('/register');
                }

                // 4. Criptografa a senha
                const salt = await bcrypt.genSalt(12);
                const hashedPassword = await bcrypt.hash(password, salt);

                // 5. Monta o novo documento do usuário (libraryId começa como nulo)
                const newUserDoc = {
                    name,
                    email,
                    password: hashedPassword,
                    isLibrarian,
                    libraryId: null
                };

                // 6. Salva o usuário e pega o ID dele
                const result = await UsersDAO.insertUser(usersCollection, newUserDoc);
                const newUserId = result.insertedId;

                // ===================================================
                // 7. LÓGICA DE REDIRECIONAMENTO (A GRANDE MUDANÇA)
                // ===================================================
                if (isLibrarian) {
                    // Se for um bibliotecário, inicie a sessão para ele...
                    req.session.isLoggedIn = true;
                    req.session.userId = newUserId;
                    req.session.userName = name;
                    req.session.isLibrarian = true;
                    req.session.libraryId = null; // Ele ainda não tem uma biblioteca associada

                    // ...e o redirecione para a página de criação de biblioteca.
                    req.flash('success_msg', 'Conta criada com sucesso! Agora, cadastre os dados da sua biblioteca.');
                    return res.redirect('/libraries/new');
                } else {
                    // Se for um usuário comum, apenas mande-o para a página de login.
                    req.flash('success_msg', 'Conta criada com sucesso! Por favor, faça o login.');
                    return res.redirect("/login");
                }
            } catch (err) {
                console.error("Erro no registro:", err);
                req.flash('error_msg', 'Ocorreu um erro ao criar sua conta.');
                res.redirect('/register');
            }
        });

        app.get('/login', (req, res) => res.render('login.ejs'));

        app.post('/login', async (req, res) => {
            const { email, password } = req.body;
            const user = await UsersDAO.getUserByEmail(usersCollection, email);
            if (!user || !(await bcrypt.compare(password, user.password))) {
                req.flash('error_msg', 'E-mail ou senha inválidos.');
                return res.redirect('/login');
            }

            req.session.isLoggedIn = true;
            req.session.userId = user._id;
            req.session.userName = user.name;
            req.session.isLibrarian = user.isLibrarian;
            req.session.libraryId = user.libraryId;

            res.redirect('/');
        });

        app.get('/logout', (req, res) => {
            req.session.destroy(err => {
                if (err) { return res.redirect('/'); }
                res.clearCookie('connect.sid');
                res.redirect('/login');
            });
        });

        // Em app.js, adicione esta rota

        app.get('/profile', async (req, res) => {
            // 1. Protege a rota: só para usuários logados
            if (!req.session.isLoggedIn) {
                req.flash('error_msg', 'Você precisa estar logado para ver seu perfil.');
                return res.redirect('/login');
            }

            try {
                const userId = new ObjectId(req.session.userId);

                // 2. Usa agregação para buscar o usuário e os dados da sua biblioteca (se existir)
                const userData = await usersCollection.aggregate([
                    { $match: { _id: userId } },
                    {
                        $lookup: {
                            from: 'libraries',
                            localField: 'libraryId',
                            foreignField: '_id',
                            as: 'libraryDetails'
                        }
                    },
                    {
                        $unwind: {
                            path: '$libraryDetails',
                            preserveNullAndEmptyArrays: true // Mantém o usuário mesmo se ele não tiver biblioteca
                        }
                    }
                ]).toArray();

                if (userData.length === 0) {
                    req.flash('error_msg', 'Usuário não encontrado.');
                    return res.redirect('/');
                }

                // 3. Renderiza a página, passando os dados encontrados
                res.render('profile', { user: userData[0] });

            } catch (err) {
                console.error("Erro ao carregar perfil:", err);
                req.flash('error_msg', 'Não foi possível carregar seu perfil.');
                res.redirect('/');
            }
        });

        // Em app.js, adicione esta rota

        app.post('/profile', async (req, res) => {
            if (!req.session.isLoggedIn) {
                return res.redirect('/login');
            }

            const { isLibrarian, accessKey } = req.body;
            const userId = req.session.userId;

            // Se o usuário marcou a caixa "Sou um bibliotecário" e enviou um código
            if (isLibrarian === 'on' && accessKey) {
                try {
                    // 1. Encontra a biblioteca pelo código de acesso
                    const library = await LibrariesDAO.findLibraryByAccessKey(librariesCollection, accessKey);

                    if (!library) {
                        req.flash('error_msg', 'Código de Acesso da Biblioteca inválido.');
                        return res.redirect('/profile');
                    }

                    // 2. Atualiza o documento do usuário
                    await UsersDAO.assignLibraryToUser(usersCollection, userId, library._id);
                    // Também atualizamos o status de bibliotecário
                    await usersCollection.updateOne({ _id: new ObjectId(userId) }, { $set: { isLibrarian: true } });

                    // 3. Atualiza a sessão para refletir a mudança imediatamente
                    req.session.isLibrarian = true;
                    req.session.libraryId = library._id;

                    req.flash('success_msg', `Agora você é um bibliotecário da ${library.name}!`);
                    res.redirect('/profile');

                } catch (err) {
                    console.error("Erro ao se tornar bibliotecário:", err);
                    req.flash('error_msg', 'Ocorreu um erro ao processar sua solicitação.');
                    res.redirect('/profile');
                }
            } else {
                // Se o formulário foi enviado sem as informações necessárias
                res.redirect('/profile');
            }
        });

        // ROTA GET PARA MOSTRAR O FORMULÁRIO DE CADASTRO DE BIBLIOTECA
        app.get('/libraries/new', (req, res) => {
            // Adicionaremos uma verificação para garantir que só usuários logados possam criar bibliotecas
            if (!req.session.isLoggedIn) {
                req.flash('error_msg', 'Você precisa estar logado para criar uma nova biblioteca.');
                return res.redirect('/login');
            }
            res.render('new-library.ejs');
        });

        // ROTA PARA EXIBIR A PÁGINA DE DECISÃO PARA BIBLIOTECÁRIOS
        app.get('/libraries/onboarding', (req, res) => {
            if (!req.session.isLoggedIn || !req.session.isLibrarian) {
                req.flash('error_msg', 'Acesso não autorizado.');
                return res.redirect('/');
            }
            res.render('library-onboarding.ejs');
        });

        app.post('/libraries/create', async (req, res) => {
            // 1. Validação: Garante que o usuário está logado
            if (!req.session.isLoggedIn) {
                req.flash('error_msg', 'Você precisa estar logado para criar uma biblioteca.');
                return res.redirect('/login');
            }

            try {
                // 2. Pega os dados do formulário e da sessão
                const libraryData = req.body;
                const userId = req.session.userId;

                // 3. Geração do Código de Acesso
                const accessKey = generateAccessKey();

                // 4. Monta o documento final para salvar no banco
                const newLibraryDoc = {
                    name: libraryData.name,
                    address: {
                        street: libraryData.street,
                        city: libraryData.city,
                        state: libraryData.state,
                        zipCode: libraryData.zipCode
                    },
                    accessKey: accessKey,
                    phoneNumber: libraryData.phoneNumber || '',
                    openingHours: libraryData.openingHours || 'Não informado',
                    website: libraryData.website || '',
                    imageUrl: libraryData.imageUrl || ''
                };

                // 5. Salva a nova biblioteca e associa ao usuário
                const result = await LibrariesDAO.createLibrary(librariesCollection, newLibraryDoc);
                const newLibraryId = result.insertedId;

                await UsersDAO.assignLibraryToUser(usersCollection, userId, newLibraryId);

                // 6. Atualiza a sessão e redireciona com mensagem de sucesso
                req.session.libraryId = newLibraryId;
                req.flash('success_msg', `Biblioteca "${newLibraryDoc.name}" criada! O código de acesso é: ${accessKey}`);
                res.redirect('/');

            } catch (err) {
                // 7. Tratamento de Erro
                console.error("Erro ao criar biblioteca:", err);
                req.flash('error_msg', 'Não foi possível criar a biblioteca. Tente novamente.');
                res.redirect('/libraries/new');
            }
        });

        // ROTA PARA UM USUÁRIO SE JUNTAR A UMA BIBLIOTECA USANDO UM CÓDIGO DE ACESSO
        app.post('/libraries/join', async (req, res) => {
            // 1. Garante que o usuário está logado
            if (!req.session.isLoggedIn) {
                req.flash('error_msg', 'Você precisa estar logado para entrar em uma biblioteca.');
                return res.redirect('/login');
            }

            try {
                // 2. Pega o accessKey do formulário e o userId da sessão
                const { accessKey } = req.body;
                const userId = req.session.userId;

                // 3. Usa o LibrariesDAO para encontrar a biblioteca pelo código
                const library = await LibrariesDAO.findLibraryByAccessKey(librariesCollection, accessKey);

                // 4. Se a biblioteca não for encontrada, mostra um erro
                if (!library) {
                    req.flash('error_msg', 'Código de acesso inválido ou biblioteca não encontrada.');
                    return res.redirect('/'); // ou para a página do formulário
                }

                // 5. Se encontrou, usa o UsersDAO para associar o usuário à biblioteca
                await UsersDAO.assignLibraryToUser(usersCollection, userId, library._id);

                // 6. ATUALIZA A SESSÃO: Importante para que a mudança reflita imediatamente
                req.session.libraryId = library._id;

                // 7. Redireciona com uma mensagem de sucesso
                req.flash('success_msg', `Você agora faz parte da ${library.name}!`);
                res.redirect('/');

            } catch (err) {
                console.error("Erro ao tentar entrar na biblioteca:", err);
                req.flash('error_msg', 'Ocorreu um erro, tente novamente.');
                res.redirect('/'); // ou para a página do formulário
            }
        });

        // ROTA PARA DELETAR UMA BIBLIOTECA
        app.post('/libraries/delete/:id', async (req, res) => {
            const libraryId = req.params.id;
            const session = req.session;

            // Proteção: Apenas um bibliotecário logado pode tentar excluir,
            // e ele deve pertencer à biblioteca que está tentando excluir.
            if (!session.isLoggedIn || !session.isLibrarian) {
                req.flash('error_msg', 'Ação não autorizada.');
                return res.redirect('/');
            }

            // Converte ambos para string para uma comparação segura
            if (session.libraryId.toString() !== libraryId) {
                req.flash('error_msg', 'Você não tem permissão para excluir esta biblioteca.');
                return res.redirect('/');
            }

            try {
                // Passa o objeto 'db' inteiro para o método do DAO, 
                // pois ele precisa acessar múltiplas coleções.
                await LibrariesDAO.deleteLibraryCascade(db, libraryId);

                // Limpa o libraryId da sessão do usuário, já que a biblioteca não existe mais
                req.session.libraryId = null;

                req.flash('success_msg', 'A biblioteca e todos os seus dados foram excluídos com sucesso.');
                res.redirect('/'); // Redireciona para a página principal

            } catch (err) {
                req.flash('error_msg', 'Não foi possível excluir a biblioteca.');
                res.redirect('/'); // Ou para a página de perfil da biblioteca
            }
        });

        // ROTA PARA EXIBIR O PERFIL DE UMA BIBLIOTECA
        app.get('/libraries/:id', async (req, res) => {
            try {
                const libraryId = req.params.id;

                // 1. Busca os dados da biblioteca e os livros dela em paralelo
                const [library, books] = await Promise.all([
                    LibrariesDAO.getLibraryById(librariesCollection, libraryId),
                    BooksDAO.getBooksByLibraryId(booksCollection, libraryId)
                ]);

                if (!library) {
                    req.flash('error_msg', 'Biblioteca não encontrada.');
                    return res.redirect('/');
                }

                // 2. Verifica se o usuário logado é um bibliotecário DESTA biblioteca
                let isManagerOfThisLibrary = false;
                if (req.session.isLibrarian && req.session.libraryId?.toString() === library._id.toString()) {
                    isManagerOfThisLibrary = true;
                }

                // 3. Renderiza a página, passando todos os dados necessários
                res.render('library-profile', {
                    library: library,
                    books: books,
                    isManager: isManagerOfThisLibrary
                });

            } catch (err) {
                console.error("Erro ao carregar perfil da biblioteca:", err);
                req.flash('error_msg', 'Não foi possível carregar a página da biblioteca.');
                res.redirect('/');
            }
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