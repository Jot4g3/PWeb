const express = require("express")
const app = express()
const port = 3000

app.get("/", (req, res) => {
    res.send("Raiz")
    console.log("Acessou página/rota Raiz ("+Date.now()+")")
})

app.get("/about", (req, res) => {
    res.send("Sobre")
    console.log("Acessou página/rota Sobre ("+Date.now()+")")
})

app.post("/data", (req, res) => {
    res.send("Dados")
    console.log("Acessou página/rota Dados ("+Date.now()+")")
})

app.get("/users", (req, res) => {
    res.send("Usuários")
    console.log("Acessou página/rota Usuários ("+Date.now()+")")
})

app.get("/users/signin", (req, res) => {
    res.send("Usuários")
    console.log("Acessou página/rota Usuários-SignIn ("+Date.now()+")")
})

app.get("/users/signin/:userid", (req, res) => {
    res.send("Seja bem-vindo "+req.params.userid+"!")
    console.log("Acessou página/rota Usuários-SignIn ("+Date.now()+")")
})

app.get("/users/signup", (req, res) => {
    res.send("Usuários")
    console.log("Acessou página/rota Usuários-SignUp ("+Date.now()+")")
})

var nothing;
app.get(nothing, (req, res) => {
    if (nothing =! "/users"){}
})

app.listen(port, () => {
    console.log("Escutando na porta " + port)
})