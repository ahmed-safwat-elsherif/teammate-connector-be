import fs from 'fs';
import path from 'path';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { __dirname } from '../../filePath.js';

const PACKAGE_JSON_PATH = path.join(__dirname, '/package.json');
const { version } = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, { encoding: 'utf-8' }));

/** @type {swaggerJsdoc.Options} */
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Teammate Connector API Docs',
      version,
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

/** @param {import('express').Express} app */
function swaggerDocs(app) {
  // Swagger page
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  // Docs in JSON format
  app.get('/docs.json', (_, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
}

export default swaggerDocs;

//
