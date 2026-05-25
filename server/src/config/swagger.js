const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Stock_Medoc',
      version: '1.0.0',
      description: 'Documentation de l\'API de gestion de stock de médicaments',
    },
    servers: [
      {
        url: 'https://stock-medoc-production.up.railway.app/api',
        description: 'Serveur de Production (Railway)',
      },
      {
        url: 'http://localhost:5000/api',
        description: 'Serveur de développement local',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: ['./src/routes/*.js'], 
};

const specs = swaggerJsdoc(options);
module.exports = specs;