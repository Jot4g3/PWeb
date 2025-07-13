const { ObjectId } = require('mongodb');

class ReservationsDAO {
    /**
     * Cria um novo documento de reserva.
     */
    static async createReservation(client, reservationDoc) {
        try {
            return await client.insertOne(reservationDoc);
        } catch (err) {const { ObjectId } = require('mongodb');

class ReservationsDAO {
    /**
     * Cria um novo documento de reserva.
     */
    static async createReservation(client, reservationDoc) {
        try {
            return await client.insertOne(reservationDoc);
        } catch (err) {
            console.error("Erro ao criar reserva:", err);
            throw err;
        }
    }

    /**
     * Encontra uma reserva específica por usuário e livro.
     * Útil para verificar se o usuário já reservou este título.
     */
    static async findReservation(client, userId, bookId) {
        try {
            return await client.findOne({
                userId: new ObjectId(userId),
                bookId: new ObjectId(bookId)
            });
        } catch (err) {
            console.error("Erro ao buscar reserva:", err);
            throw err;
        }
    }

    /**
     * Conta quantas reservas ativas um usuário possui.
     * Útil para verificar o limite de 5 reservas.
     */
    static async countUserReservations(client, userId) {
        try {
            return await client.countDocuments({
                userId: new ObjectId(userId)
            });
        } catch (err) {
            console.error("Erro ao contar reservas do usuário:", err);
            throw err;
        }
    }
}

module.exports = ReservationsDAO;
            console.error("Erro ao criar reserva:", err);
            throw err;
        }
    }

    /**
     * Encontra uma reserva específica por usuário e livro.
     * Útil para verificar se o usuário já reservou este título.
     */
    static async findReservation(client, userId, bookId) {
        try {
            return await client.findOne({
                userId: new ObjectId(userId),
                bookId: new ObjectId(bookId)
            });
        } catch (err) {
            console.error("Erro ao buscar reserva:", err);
            throw err;
        }
    }

    /**
     * Conta quantas reservas ativas um usuário possui.
     * Útil para verificar o limite de 5 reservas.
     */
    static async countUserReservations(client, userId) {
        try {
            return await client.countDocuments({
                userId: new ObjectId(userId)
            });
        } catch (err) {
            console.error("Erro ao contar reservas do usuário:", err);
            throw err;
        }
    }
}

module.exports = ReservationsDAO;