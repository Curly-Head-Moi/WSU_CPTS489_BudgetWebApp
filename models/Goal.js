const sequelize = require('../db');
const { Model, DataTypes } = require('sequelize');

class Goal extends Model {
    static async findByUser(userId) {
        try {
            return await Goal.findAll({ where: { userId } });
        } catch (error) {
            console.error('Error fetching goals:', error);
            return null;
        }
    }
}

Goal.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
    },
    userId: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'email'
        },
        onDelete: 'CASCADE'
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isIn: [['total', 'Food', 'Housing', 'Transportation', 'Utilities', 'Entertainment', 'Healthcare', 'Other']]
        }
    },
    amount: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        validate: {
            min: 0
        }
    }
}, {
    sequelize,
    modelName: 'Goal',
    tableName: 'Goals',
    timestamps: false
});

module.exports = Goal;
