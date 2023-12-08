import { DataTypes } from "sequelize";
import colors from "colors";
import sequelize from "../db/teammate.db.js";

const Cabinet = sequelize.define(
  "Cabinet",
  {
    id: {
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    oneSumXId: {
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
Cabinet.sync({ alter: true }).then(() => {
  console.log(colors.green("✅ Cabinet table is created/altered successfully"));
});

export default Cabinet;
