const { Model, DataTypes } = require('sequelize');
const sequelize = require('../db');


class Transaction extends Model {
    static async findByOwner(email) {
        try {
            return await Transaction.findAll({ where: { userEmail: email } });
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
    userEmail: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'email'
        },
        onDelete: 'CASCADE'
    }
}, {
    sequelize,
    modelName: 'Transaction',
    tableName: 'Transactions',
    timestamps: true
});

module.exports = Transaction;
