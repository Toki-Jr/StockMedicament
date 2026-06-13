const swaggerJsdoc = require('swagger-jsdoc');
// Swagger permet de générer automatiquement la documentation d'une API REST.
// Biblio lit les commentaires
// Développeur → lit le code → cherche les routes → teste avec Postman
// Développeur → ouvre Swagger UI → voit toutes les routes → teste directement

// Configuration du swagger
const options = {
  definition: {
    openapi: '3.0.0', // Utilise le norme OpenAPI V.3
    info: {
      title: 'API Stock_Medoc',
      version: '1.0.0',
      description: 'Documentation de l\'API de gestion de stock de médicaments',
    },
    servers: [ // Declaration du serveur
      {
        url: 'http://localhost:5000/api',
        description: 'Serveur de développement',
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
    security: [{ bearerAuth: [] }] // All routes necessitent un JWT par defaut
  },
  
  apis: ['./src/routes/*.js'], // Scan * files dans routes
};

const specs = swaggerJsdoc(options); // Genere la documentation OpenAPI

module.exports = specs;