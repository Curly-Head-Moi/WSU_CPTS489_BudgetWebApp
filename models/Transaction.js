const { Model, DataTypes } = require('sequelize');
const sequelize = require('../db');


class Transaction extends Model {
    static async findByOwner(email) {
        try {
            return await Transaction.findAll({ 
                where: { userEmail: email },
                order: [['date', 'DESC']]
            });
        } catch (error) {
            console.error(error);
            return null;
        }
    }
    
    static async createTransaction(transactionData) {
        try {
            return await Transaction.create(transactionData);
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
    
    static async updateTransaction(id, transactionData, userEmail) {
        try {
            const [updatedRows] = await Transaction.update(transactionData, {
                where: { 
                    id: id,
                    userEmail: userEmail
                }
            });
            if (updatedRows === 0) {
                throw new Error('Transaction not found or not authorized to update');
            }
            return await Transaction.findByPk(id);
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
    
    static async deleteTransaction(id, userEmail) {
        try {
            const deletedCount = await Transaction.destroy({
                where: { 
                    id: id,
                    userEmail: userEmail
                }
            });
            if (deletedCount === 0) {
                throw new Error('Transaction not found or not authorized to delete');
            }
            return deletedCount;
        } catch (error) {
            console.error(error);
            throw error;
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
    description: {
        type: DataTypes.STRING,
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
    category: {
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
