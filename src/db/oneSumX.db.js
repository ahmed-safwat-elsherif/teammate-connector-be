import { Sequelize } from 'sequelize';
import { dbOSXOrigin, dbOSXPort, dbOSXUser, dbOSXPass } from '../config/index.js';

const sequelize = new Sequelize('GRC_DEMO', dbOSXUser, dbOSXPass, {
  host: dbOSXOrigin,
  dialect: 'mssql',
  port: dbOSXPort,
  logging: false,
});

export default sequelize;
