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

    static async getUserById(client, id) {
        try {
            const cursor = await client
                .findOne({ _id: new ObjectId(id) })

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
}

module.exports = UsersDAO