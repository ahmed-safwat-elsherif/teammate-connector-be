import { DataTypes } from 'sequelize';
import colors from 'colors';
import sequelize from '../db/teammate.db.js';

const Control = sequelize.define(
  'Control',
  {
    id: {
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    riskOsxId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    oneSumXId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: true,
  }
);
Control.sync({ alter: true }).then(() => {
  console.log(colors.green('✅ Control table is created/altered successfully'));
});

export default Control;
