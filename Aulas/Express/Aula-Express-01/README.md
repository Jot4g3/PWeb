# 📘 Aula-Express-01 — Middleware e Rotas com Express.js

Atividade prática da disciplina de **Programação Web** no IFCE — Campus Fortaleza, com foco em criação de rotas, middlewares e tratamento de erros usando **Express.js**.

## 🎯 Objetivos

- Criar middlewares específicos para cada rota  
- Criar middleware de aplicação para registrar acessos no console  
- Trabalhar com parâmetros de rota (`:userid`)  
- Redirecionar usuários com `res.redirect()`  
- Tratar rotas inválidas com `res.status()` e página de erro 404  

## 🚧 Funcionalidades implementadas

✅ **1. Middlewares por rota**  
Cada rota principal (`/`, `/about`, `/signin`, `/signup`) possui um middleware próprio que envia uma resposta HTML com o nome da rota exibido na página.

✅ **2. Middleware global de aplicação**  
Um middleware geral registra no console do servidor cada acesso às rotas, mostrando o caminho acessado e a data/hora.

✅ **3. Rota dinâmica com parâmetro**  
Na rota `/signin`, o usuário pode acessar `/users/:userid`, e o servidor responde com uma mensagem de boas-vindas usando o `userid` passado na URL.  
Exemplo:  
/users/signin/joão → "Bem-vindo, joão!"

✅ **4. Redirecionamento se `userid` não for informado**  
Se o usuário acessar `/users` sem fornecer um `:userid`, ele é redirecionado automaticamente para a página de `/signup` usando `res.redirect()`.

✅ **5. Tratamento de rotas inválidas (404)**  
Se o usuário acessar uma rota inexistente, é exibida uma página personalizada de erro 404 com um link de volta para a **Home (`/`)**, usando `res.status(404)`.

## ▶️ Como executar

1. Acesse a pasta do projeto:
```bash
cd aulas/express/Aula-Express-01
```

2. Instale as dependências:
```bash
npm install
```

3. Execute a aplicação:
```bash
node app.js
```

4. Acesse no navegador:
`http://localhost:3000`  

✍️ Desenvolvido como parte do conteúdo de Express.js — Programação Web  
📅 Semestre 2025.1 — IFCE Fortaleza  
