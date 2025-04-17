const sequelize = require('../db')
const { Model, DataTypes, Op } = require('sequelize')
const bcrypt = require('bcrypt')

class User extends Model {
    static async findUser(emailOrUsername, password) {
        try {
            const user = await User.findOne({
                where: {
                    [Op.or]: [
                        { email: emailOrUsername },
                        { username: emailOrUsername }
                    ]
                }
            });
            
            if (user && await bcrypt.compare(password, user.password)) {
                return user;
            } else {
                return null;
            }
        } catch (error) {
            console.log(error);
            return null;
        }
    }
    
    static async createUser(userData) {
        try {
            // Hash the password
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            
            // Create the user with hashed password
            const user = await User.create({
                ...userData,
                password: hashedPassword
            });
            
            return user;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
}

User.init({
  firstName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  termsAccepted: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  isAdmin: {
    type        : DataTypes.BOOLEAN,
    allowNull   : false,
    defaultValue: false,
  }
  
}, {
  sequelize,
  modelName: 'User',
  tableName: 'Users',
  timestamps: true
});

module.exports = User