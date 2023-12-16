import { DataTypes } from "sequelize";
import colors from "colors";
import sequelize from "../db/teammate.db.js";

const ControlFolder = sequelize.define(
  "ControlFolder",
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
ControlFolder.sync({ alter: true }).then(() => {
  console.log(
    colors.green("✅ Control Folders table is created/altered successfully")
  );
});

export default ControlFolder;
