const express = require("express")
const app = express()
const port = 3000

// Middleware para registrar o tempo de requisição
// Middleware é uma função que tem acesso ao objeto de requisição (req), ao objeto de resposta (res) e à próxima função de middleware na pilha (next).
// O middleware pode executar qualquer código, fazer alterações nos objetos de requisição e resposta, encerrar o ciclo de solicitação/resposta e chamar a próxima função de middleware na pilha.
// Se o middleware não chamar next(), a solicitação será finalizada e não passará para o próximo middleware ou rota.
// O middleware pode ser usado para registrar informações, autenticar usuários, manipular dados de solicitação, etc.
// Neste caso, estamos apenas registrando o tempo de requisição no objeto de requisição (req) para que possamos usá-lo nas rotas.
//OBS.: Isso não foi GPT, foi só eu seguindo as bobagens do Copilot, mas eu não sei o que é middleware, então não posso explicar o que é. (Talez isso tenha sido uma bobagem do Copilot também. (E isso também. (Não acaba mais...)))

app.use((req, res, next) => {
    req.requestTime = new Date().toLocaleString();
    next();
});

app.get("/", (req, res) => {
    res.send("Raiz")
    console.log("Acessou página/rota Raiz ("+req.requestTime+")")
})

app.get("/about", (req, res) => {
    res.send("Sobre")
    console.log("Acessou página/rota Sobre ("+req.requestTime+")")
})

app.post("/data", (req, res) => {
    res.send("Dados")
    console.log("Acessou página/rota Dados ("+req.requestTime+")")
})

app.get("/users", (req, res) => {
    res.send("Usuários")
    console.log("Acessou página/rota Usuários ("+req.requestTime+")")
})

app.get("/users/signin", (req, res) => {
    console.log("Acessou página/rota Usuários-SignIn (" + req.requestTime + ")");
    // Já que o usuário não está logado, redireciona para a página de cadastro.
    res.redirect("http://localhost:3000/users/signup");
});


app.get("/users/signin/:userid", (req, res) => {
    res.send("Seja muito bem-vindo "+req.params.userid+"!")
    console.log("Acessou página/rota Usuários-SignIn ("+req.requestTime+")")
})

app.get("/users/signup", (req, res) => {
    res.send("Usuários-SignUp")
    console.log("Acessou página/rota Usuários-SignUp ("+req.requestTime+")")
})

app.use((req, res) => {
    res.status(404).send(`
        Página não encontrada
        Você acessou a página ${req.originalUrl} às ${req.requestTime}
        <a href="http://localhost:3000/">Voltar para a página inicial</a>
    `)
})

app.listen(port, () => {
    console.log("Escutando na porta " + port)
})