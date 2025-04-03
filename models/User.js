const sequelize = require('../db')
const { Model, DataTypes } = require('sequelize')

class User extends Model {
    static async findUser(email, password){
        try {
            const user = await User.findByPk(email)
            if(user && user.password === password){
                return user
            }else{
                return null
            }
        } catch (error) {
            console.log(error)
            return null
        }
    }
}

User.init({
  email: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  sequelize, 
  modelName: 'User'
});

module.exports = User