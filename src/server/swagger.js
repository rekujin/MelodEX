import swaggerJsdoc from 'swagger-jsdoc';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MelodEX API',
      version: '1.0.0',
      description: 'API для получения плейлистов из разных музыкальных сервисов',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}`,
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/server/server.js'],
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);
