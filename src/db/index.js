import { Sequelize } from "sequelize";
import colors from "colors";
import { dbPass, dbPort, dbUsername } from "../config/index.js";

const sequelize = new Sequelize("Teammate", dbUsername, dbPass, {
  host: "localhost",
  dialect: "mssql",
  port: dbPort,
});

try {
  await sequelize.authenticate();
  console.log(colors.green("✅ Connection has been established successfully."));
} catch (error) {
  console.log(colors.red("❌ Unable to connect to the database:"));
  console.dir(error);
}

export default sequelize;
