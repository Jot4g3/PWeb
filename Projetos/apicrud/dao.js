const { ObjectId } = require(`mongodb`)

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

    static async getAllBooks (client){
        const cursor = await client
        .find()
        .sort({title: 1})

        try {
            const results = await cursor.toArray();
            return results
        } catch (err) {
            console.log(err)
        }
    }

    static async deleteBookById(client, id){
        const ok = await client
        .deleteOne({ _id: new ObjectId(id) })
        try{
            return ok
        }
        catch(err){
            console.log(err)
        }
    }
}

module.exports = BooksDAO