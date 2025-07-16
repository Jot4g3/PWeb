const { ObjectId } = require(`mongodb`)

class BooksDAO {
    // CRUD
    static async insertBook(client, doc) {
        try {
            const ok = await client.insertOne(doc)
            return ok
        } catch (err) {
            console.log(err)
        }
    }

    // Em BooksDAO.js
    static async getAllBooks(client) {
        try {
            const pipeline = [
                // 1º JOIN: Junta 'books' com 'users' para pegar o nome de quem cadastrou
                {
                    $lookup: {
                        from: "users",
                        localField: "createdBy",
                        foreignField: "_id",
                        as: "librarianInfo"
                    }
                },
                // 2º JOIN: Junta o resultado com 'libraries' para pegar os dados da biblioteca
                {
                    $lookup: {
                        from: "libraries",
                        localField: "libraryId",
                        foreignField: "_id",
                        as: "libraryInfo"
                    }
                },
                // Desconstrói os arrays resultantes para facilitar o acesso
                { $unwind: { path: "$librarianInfo", preserveNullAndEmptyArrays: true } },
                { $unwind: { path: "$libraryInfo", preserveNullAndEmptyArrays: true } },
                // Formata o documento final que será enviado para a tela
                {
                    $project: {
                        title: 1,
                        author: 1,
                        bookpublisher: 1,
                        year: 1,
                        price: 1,
                        availableQuantity: { $subtract: [{ $toInt: "$quantity" }, "$qttReserved"] },
                        librarianName: "$librarianInfo.name",
                        // Aninha os dados da biblioteca em um objeto para facilitar o acesso
                        library: {
                            _id: "$libraryInfo._id",
                            name: "$libraryInfo.name",
                            address: "$libraryInfo.address"
                        }
                    }
                },
                { $sort: { title: 1 } }
            ];

            const results = await client.aggregate(pipeline).toArray();
            return results;
        } catch (err) {
            console.error("Erro ao agregar livros com usuários e bibliotecas:", err);
            throw err;
        }
    }

    static async getBookById(client, id) {
        try {
            const cursor = await client
                .findOne({ _id: new ObjectId(id) })

            return cursor
        }
        catch (err) {
            console.log(err)
        }
    }

    static async deleteBookById(client, id) {
        try {
            const ok = await client
                .deleteOne({ _id: new ObjectId(id) })

            return ok
        }
        catch (err) {
            console.log(err)
        }
    }

    static async updateBookById(client, id, bookUpdated) {
        try {
            const ok = await client.updateOne(
                { _id: new ObjectId(id) },
                { $set: bookUpdated }
            )

            return ok
        } catch (err) {
            console.log(err)
        }
    }
    
    static async getBooksByLibraryId(client, libraryId) {
        try {
            const pipeline = [
                // 1. Filtra apenas os livros da biblioteca especificada
                { $match: { libraryId: new ObjectId(libraryId) } },
                // O resto da agregação é igual à que já temos em getAllBooks
                { $lookup: { from: "users", localField: "createdBy", foreignField: "_id", as: "librarianInfo" } },
                { $unwind: { path: "$librarianInfo", preserveNullAndEmptyArrays: true } },
                {
                    $project: {
                        title: 1, author: 1, bookpublisher: 1, year: 1, price: 1,
                        availableQuantity: { $subtract: [{ $toInt: "$quantity" }, "$qttReserved"] },
                        librarianName: "$librarianInfo.name"
                        // Não precisamos dos dados da biblioteca aqui, pois já estamos na página dela
                    }
                },
                { $sort: { title: 1 } }
            ];
            return await client.aggregate(pipeline).toArray();
        } catch (err) {
            console.error("Erro ao buscar livros por ID da biblioteca:", err);
            throw err;
        }
    }
}

module.exports = BooksDAO