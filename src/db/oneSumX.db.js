import { Sequelize } from "sequelize";
import { dbPass, dbPort, dbUsername } from "../config/index.js";

const sequelize = new Sequelize("GRC_DEMO", dbUsername, dbPass, {
  host: "localhost",
  dialect: "mssql",
  port: dbPort,
  logging: false,
});

export default sequelize;
