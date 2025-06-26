const express = require('express')
const { capitalize } = require("./util/functions")
const app = express()
const PORT = 8000
app.set('json spaces', 4);
app.use(express.urlencoded({ extended: true }));

app.listen(PORT, ()=> {
    const msg = `Hello API running on PORT ${PORT}`
    const link = `http://localhost:${PORT}`
    const flink = `\x1b[1m${link}\x1b[0m`
    console.log(msg + '\n' + flink)
})

app.get('/v1/hi', function(req, res) {
    const out = {
        msg: "Hello, world!"
    }
    res.json(out)
})

const users = [
  { name: "Ana Silva", id: "1" },
  { name: "Bruno Souza", id: "2" },
  { name: "Carla Mendes", id: "3" },
  { name: "Diego Rocha", id: "4" },
  { name: "Eduarda Lima", id: "5" },
  { name: "Felipe Alves", id: "6" },
  { name: "Gabriela Torres", id: "7" },
  { name: "Henrique Martins", id: "8" },
  { name: "Isabela Costa", id: "9" },
  { name: "João Vitor", id: "10" }
];


app.get('/v1/hi/user/:name', function (req, res) {
    const userToFind = req.params.name.toLowerCase();

    const usersFiltered = users
        .filter(user => user.name.toLowerCase().includes(userToFind))
        .map(user => ({
            name: user.name,
            id: user.id
        }));

    // Se nenhum usuário for encontrado:
    if (usersFiltered.length === 0) {
        return res.status(404).json({ msg: "Usuário não encontrado." });
    }

    res.json(usersFiltered);
});


app.post('/v1/hi', (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ error: "Name is required" });
    }

    const out = {
        msg: `Hello, ${name.toUpperCase()} from POST!`,
    };
    res.status(200).json(out);
});
// express v4 use '/*'
// express v5 use '/*splat'
app.get('/*splat', function(req, res) {
    const err = {
        error: 'Invalid endpoint'
    }
    res.json(err)
})