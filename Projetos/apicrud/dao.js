class BooksDAO{
    // CRUD

    //Create
    
    static async insertBook(client, doc){
        try {
            const ok = await client.insertOne(doc)
            return ok
        } catch (err){
            console.log(err)
        }
    }
}

module.exports = BooksDAO