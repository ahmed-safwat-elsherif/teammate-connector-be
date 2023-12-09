import { DataTypes } from "sequelize";
import colors from "colors";
import sequelize from "../db/teammate.db.js";

const Folder = sequelize.define(
  "Folder",
  {
    id: {
      primaryKey: true,
      type: DataTypes.INTEGER,
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
Folder.sync({ alter: true }).then(() => {
  console.log(colors.green("✅ Folder table is created/altered successfully"));
});

export default Folder;
