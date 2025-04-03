const { Model, DataTypes } = require('sequelize');
const sequelize = require('../db');


class Transaction extends Model {
    static async findByOwner(username) {
        try {
            return await Transaction.findAll({ where: { owner: username } });
        } catch (error) {
            console.error(error);
            return null;
        }
    }
}

Transaction.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
    },
    amount: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },
    transactionType: {
        type: DataTypes.STRING,
        allowNull: false
    },
    date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    owner: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'Transaction'
});

module.exports = Transaction;
