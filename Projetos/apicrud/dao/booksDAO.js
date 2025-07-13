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

    static async getAllBooks(client) {
        try {
            const pipeline = [
                // Estágio 1: "Juntar" a coleção de livros com a de usuários
                {
                    $lookup: {
                        from: "users", // A outra coleção
                        localField: "createdBy", // O campo na coleção de livros
                        foreignField: "_id", // O campo na coleção de usuários
                        as: "librarianInfo" // O nome do novo array com os dados do usuário
                    }
                },
                // Estágio 2: "Desconstruir" o array para facilitar o acesso
                {
                    $unwind: {
                        path: "$librarianInfo",
                        preserveNullAndEmptyArrays: true // Mantém livros mesmo se não tiverem bibliotecário
                    }
                },
                // Estágio 3: Formatar a saída final
                {
                    $project: {
                        // Mantém todos os campos originais do livro
                        title: 1,
                        author: 1,
                        bookpublisher: 1,
                        year: 1,
                        quantity: 1,
                        price: 1,
                        librarianName: "$librarianInfo.name",
                        availableQuantity: {
                            $subtract: [
                                { $toInt: "$quantity" }, // Converte o campo quantity para inteiro
                                "$qttReserved"
                            ]
                        }
                    }
                },
                // Estágio 4: Ordenar pelo título
                {
                    $sort: { title: 1 }
                }
            ];

            const results = await client.aggregate(pipeline).toArray();
            return results;

        } catch (err) {
            console.log(err);
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
}

module.exports = BooksDAO