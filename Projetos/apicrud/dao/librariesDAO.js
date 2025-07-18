const { ObjectId } = require('mongodb');

class LibrariesDAO {
    /**
     * Cria um novo documento de biblioteca.
     */
    static async createLibrary(client, libraryDoc) {
        try {
            // Usa o método insertOne para adicionar o novo documento à coleção
            return await client.insertOne(libraryDoc);
        } catch (err) {
            console.error("Erro ao criar a biblioteca no DAO:", err);
            throw err; // Relança o erro para a rota poder tratá-lo
        }
    }

    /**
     * Encontra uma biblioteca pelo seu código de acesso.
     */
    static async findLibraryByAccessKey(client, key) {
        try {
            return await client.findOne({ accessKey: key });
        } catch (err) {
            console.error("Erro ao buscar biblioteca por accessKey:", err);
            throw err;
        }
    }

    static async getLibraryById(client, id) {
        try {
            return await client.findOne({ _id: new ObjectId(id) });
        } catch (err) {
            console.error("Erro ao buscar biblioteca por ID:", err);
            throw err;
        }
    }

    /**
     * Deleta uma biblioteca e todos os seus dados associados em cascata.
     */
    static async deleteLibraryCascade(db, libraryIdToDelete) {
        const libraryId = new ObjectId(libraryIdToDelete);

        // Pega as coleções do objeto db
        const librariesCollection = db.collection('libraries');
        const booksCollection = db.collection('books');
        const reservationsCollection = db.collection('reservations');
        const usersCollection = db.collection('users');

        try {
            console.log(`Iniciando exclusão em cascata para a biblioteca: ${libraryId}`);

            // 1. Encontra todos os livros desta biblioteca
            const booksToDelete = await booksCollection.find({ libraryId: libraryId }).project({ _id: 1 }).toArray();
            const bookIdsToDelete = booksToDelete.map(book => book._id);

            if (bookIdsToDelete.length > 0) {
                // 2. Deleta todas as reservas associadas a esses livros
                const reservationResult = await reservationsCollection.deleteMany({ bookId: { $in: bookIdsToDelete } });
                console.log(`${reservationResult.deletedCount} reservas excluídas.`);

                // 3. Deleta todos os livros da biblioteca
                const bookResult = await booksCollection.deleteMany({ _id: { $in: bookIdsToDelete } });
                console.log(`${bookResult.deletedCount} livros excluídos.`);
            }

            // 4. Desassocia todos os bibliotecários desta biblioteca
            const userResult = await usersCollection.updateMany(
                { libraryId: libraryId },
                { $set: { libraryId: null } }
            );
            console.log(`${userResult.modifiedCount} usuários desassociados.`);

            // 5. Finalmente, deleta a própria biblioteca
            const libraryResult = await librariesCollection.deleteOne({ _id: libraryId });
            console.log(`${libraryResult.deletedCount} biblioteca(s) excluída(s).`);

            return { success: true };

        } catch (err) {
            console.error("Erro na exclusão em cascata da biblioteca:", err);
            throw err;
        }
    }

    static async updateLibraryById(client, id, libraryData) {
        try {
            return await client.updateOne(
                { _id: new ObjectId(id) },
                { $set: libraryData }
            );
        } catch (err) {
            console.error("Erro ao atualizar biblioteca por ID:", err);
            throw err;
        }
    }
}

module.exports = LibrariesDAO;