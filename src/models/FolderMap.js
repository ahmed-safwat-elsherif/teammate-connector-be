import { DataTypes } from 'sequelize';
import colors from 'colors';
import sequelize from '../db/teammate.db.js';

const FolderMap = sequelize.define(
  'FolderMap',
  {
    id: {
      primaryKey: true,
      type: DataTypes.INTEGER,
      autoIncrement: true,
    },
    oneSumXId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    riskFolderId: {
      type: DataTypes.INTEGER,
    },
    controlFolderId: {
      type: DataTypes.INTEGER,
    },
  },
  {
    timestamps: true,
  }
);
FolderMap.sync({ alter: true }).then(() => {
  console.log(colors.green('✅ FolderMap table is created/altered successfully'));
});

export default FolderMap;
