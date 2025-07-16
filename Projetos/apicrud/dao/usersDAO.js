const { ObjectId } = require(`mongodb`)

class UsersDAO {
    // CRUD
    static async insertUser(client, doc) {
        try {
            const ok = await client.insertOne(doc)
            return ok
        } catch (err) {
            console.log(err)
        }
    }

    static async getUserByEmail(client, email) {
        try {
            const cursor = await client
                .findOne({ email: email })

            return cursor
        }
        catch (err) {
            console.log(err)
        }
    }

    static async assignLibraryToUser(client, userId, libraryId) {
        return await client.updateOne(
            { _id: new ObjectId(userId) },
            { $set: { libraryId: new ObjectId(libraryId) } }
        );
    }


    // static async getAllBooks(client) {
    //     try {
    //         const cursor = await client
    //             .find()
    //             .sort({ title: 1 })

    //         const results = await cursor.toArray();
    //         return results
    //     } catch (err) {
    //         console.log(err)
    //     }
    // }

    // static async getBookById(client, id) {
    //     try {
    //         const cursor = await client
    //             .findOne({ _id: new ObjectId(id) })

    //         return cursor
    //     }
    //     catch (err) {
    //         console.log(err)
    //     }
    // }

    // static async deleteBookById(client, id) {
    //     try {
    //         const ok = await client
    //             .deleteOne({ _id: new ObjectId(id) })

    //         return ok
    //     }
    //     catch (err) {
    //         console.log(err)
    //     }
    // }

    // static async updateBookById(client, id, bookUpdated) {
    //     try {
    //         const ok = await client.updateOne(
    //             { _id: new ObjectId(id) },
    //             { $set: bookUpdated }
    //         )

    //         return ok
    //     } catch (err) {
    //         console.log(err)
    //     }
    // }
}

module.exports = UsersDAO