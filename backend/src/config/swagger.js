const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'CU Internship Portal API',
            version: '1.0.0',
            description: 'API documentation for the COMSATS Internship Portal system.',
        },
        servers: [
            {
                url: 'http://localhost:5000',
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [{
            bearerAuth: [],
        }],
    },
    apis: ['./src/routes/*.js', './src/controllers/*.js'], // files containing annotations as above
};

const specs = swaggerJsdoc(options);
module.exports = specs;
