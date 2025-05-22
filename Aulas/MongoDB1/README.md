# TEST_MDB

- Código fonte base utilizado na Aula 10 da disciplina Programação Web 1.

## Objetivo

- Adaptar os códigos disponbilizados para testar um *cluster* do MongoDB a partir de uma conta do Atlas.

## Instruções

1. Clonar o projeto no seu ambiente de trabalho `git clone LINK_DO_GIT`
2. Verifique as permissões de acesso ao *cluster* do Atlas
    - Nome do usuário: Security -> Database Access
    - Verificar ou cadastrar senha para o usuário: Edit -> Password -> Edit Password -> Update User
    - Verifique a partir de qual endereço IP o *cluster* pode ser acessado: Security -> Network Access (0.0.0.0/0 permite acesso de qualquer IP)
3. Copiar a *connection string* (ou *connection* URI)
    - DATABASE -> Clusters -> Connect -> MongoDB for VS Code
    - Copie o *link* que começa com `mongodb+srv`
4. Criar um arquivo com o nome `.env` na raiz do projeto
    - Adicione a linha `URI = SUA_CONNNECTION_STRING`
5. Colar a CS na atribuição da variável de nome `URI`
6. Fazer as devidas alterações em cada arquivo que utiliza a CS
    - `require('dotenv').config()`
    - `URI = process.env.URI`
7. Outras variáveis podem ser acrescentadas ao `.env`
8. Acrescente `.env` no arquivo `.gitignore`

## Referências

- [Dotenv (Youtube)](https://www.youtube.com/watch?v=YtkZR0NFd1g)
- [Uso do Dotenv](https://www.npmjs.com/package/dotenv#%EF%B8%8F-usage)