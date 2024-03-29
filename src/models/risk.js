import { DataTypes } from "sequelize";
import colors from "colors";
import sequelize from "../db/teammate.db.js";

const Risk = sequelize.define(
  "Risk",
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
Risk.sync({ alter: true }).then(() => {
  console.log(colors.green("✅ Risk table is created/altered successfully"));
});

export default Risk;
