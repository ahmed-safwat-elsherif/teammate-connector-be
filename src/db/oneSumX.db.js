import { Sequelize } from 'sequelize';
import { dbOSXOrigin, dbOSXPort, dbOSXUser, dbOSXPass, dbOSXName } from '../config/index.js';

const sequelize = new Sequelize(dbOSXName, dbOSXUser, dbOSXPass, {
  host: dbOSXOrigin,
  dialect: 'mssql',
  port: dbOSXPort,
  logging: false,
});

export default sequelize;
