import { DataTypes } from 'sequelize';
import colors from 'colors';
import sequelize from '../db/teammate.db.js';

const User = sequelize.define(
  'User',
  {
    id: {
      primaryKey: true,
      type: DataTypes.INTEGER,
      autoIncrement: true,
    },
    email:{
      type: DataTypes.STRING,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    firstname: {
      type: DataTypes.STRING,
    },
    lastname: {
      type: DataTypes.STRING,
    },
    password: {
      type: DataTypes.STRING,
    },
    role:{
      type: DataTypes.STRING,
      allowNull:false
    }
  },
  {
    timestamps: true,
  }
);

User.sync({ alter: true }).then(() => {
  console.log(colors.green('✅ Users table is created/altered successfully'));
});

export default User;
