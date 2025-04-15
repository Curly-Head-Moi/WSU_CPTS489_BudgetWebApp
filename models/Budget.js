const { Model, DataTypes } = require('sequelize');
const sequelize = require("../db");

class Budget extends Model {
    static async findByUser(email) {
        try {
            return await Budget.findAll({
                where: {userEmail: email },
                order: [['date', 'DESC']]
            });
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    static async createBudget(budgetData) {
        try {
            return await Budget.CreateBudget(budgetData);
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    static async updateBudget (id, budgetData, userEmail) {
        try {
            const [updatedRows] = await Budget.update(budgetData, {
                where: {
                    id: id,
                    userEmail: userEmail
                }
            });
            if (updatedRows === 0) {
                throw new Error('Budget was not found and/or not authorized to update!');
            }
            return await Budget.findByPK(id);
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    static async deleteBudget (id, userEmail) {
        try {
            const deletedBudget = await Budget.destroy({
                where: {
                    id: id,
                    userEmail: userEmail
                }
            });
            if (deletedBudget === 0) {
                throw new Error("Budget was not found and/or not authorized to be deleted!");
            }
            return deletedBudget;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}

Budget.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
    },
    budgetName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true
    },
    amount: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        validate: {
            min: 0
        }
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false
    },
    date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    // goal: {
    //     type: DataTypes.STRING,
    //     allowNull: true,
    //     references: {
    //         model: "Goal",
    //         key: "id"
    //     },
    //     onDelete: 'CASCADE'
    // },
    userEmail: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: "User",
            key: 'email'
        },
        onDelete: 'CASCADE'
    }
}, {
    sequelize,
    modelName: "Budget",
    tableName: "Budgets",
    timestamps: true
});

module.exports = Budget;