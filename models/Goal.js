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
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isIn: [['total', 'groceries', 'entertainment', 'dining out', 'other']]
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
    timestamps: false
});

module.exports = Goal;
