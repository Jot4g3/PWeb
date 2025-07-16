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
}

module.exports = LibrariesDAO;