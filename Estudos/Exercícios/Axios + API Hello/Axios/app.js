// AULA 13

// Axios: Biblioteca para fazer requisições HTTP no Node.js.

const axios = require("axios");

axios.get("/user", {
    params: {ID : 12345}
})
.then(function (response) {console.log("response")})
.catch(function (error) {console.log(error)});

