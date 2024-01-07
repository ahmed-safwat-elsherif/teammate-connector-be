import { Sequelize } from "sequelize";
import { dbTMOrigin, dbTMUser, dbTMPass, dbTMPort } from "../config/index.js";

const sequelize = new Sequelize("Teammate", dbTMUser, dbTMPass, {
  host: dbTMOrigin,
  dialect: "mssql",
  port: dbTMPort,
  logging: false,
});

export default sequelize;
