import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Phenom API',
      version: '1.2.4',
      description: 'API pour l\'application d\'observations OVNI de l\'app Phenom',
      contact: {
        name: 'Équipe Phenom',
        email: 'contact@phenom.app'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    /* servers: [
      {
        url: process.env.API_BASE_URL || 'http://localhost:3000',
        description: 'Serveur de développement'
      },
      {
        url: 'https://phenom-api.onrender.com',
        description: 'Serveur de production'
      }
    ], */
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT pour l\'authentification'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Une erreur est survenue'
            },
            errors: {
              type: 'array',
              items: {
                type: 'object'
              }
            }
          }
        },
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            name: {
              type: 'string',
              example: 'Jean Dupont'
            },
            email: {
              type: 'string',
              example: 'jean.dupont@example.com'
            },
            role: {
              type: 'string',
              enum: ['viewer', 'admin'],
              example: 'viewer'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Observation: {
          type: 'object',
          properties: {
            _id: {
              type: 'string'
            },
            title: {
              type: 'string',
              example: 'OVNI triangulaire'
            },
            description: {
              type: 'string',
              example: 'Observation d\'un objet triangulaire lumineux'
            },
            images: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  imageId: {
                    type: 'string',
                    example: '67890abcdef'
                  },
                  imageUrl: {
                    type: 'string',
                    example: '/api/v1/images/67890abcdef'
                  },
                  size: {
                    type: 'number',
                    example: 524288
                  },
                  format: {
                    type: 'string',
                    example: 'image/jpeg'
                  },
                  uploadedAt: {
                    type: 'string',
                    format: 'date-time'
                  }
                }
              }
            },
            location: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  enum: ['Point']
                },
                coordinates: {
                  type: 'array',
                  items: {
                    type: 'number'
                  },
                  example: [6.6323, 46.5197]
                }
              }
            },
            userId: {
              type: 'string'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Comment: {
          type: 'object',
          properties: {
            _id: {
              type: 'string'
            },
            text: {
              type: 'string',
              example: 'J\'ai vu la même chose!'
            },
            observationId: {
              type: 'string'
            },
            userId: {
              type: 'string'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Authentification',
        description: 'Opérations d\'authentification et gestion de compte'
      },
      {
        name: 'Utilisateurs',
        description: 'Gestion du profil utilisateur'
      },
      {
        name: 'Observations',
        description: 'Gestion des observations OVNI'
      },
      {
        name: 'Commentaires',
        description: 'Gestion des commentaires sur les observations'
      },
      {
        name: 'Images',
        description: 'Gestion des images avec GridFS'
      },
      {
        name: 'Administration',
        description: 'Opérations administratives (admins uniquement)'
      }
    ]
  },
  apis: ['./src/routes/*.js', './src/app.js'], // Chemins vers les fichiers contenant les annotations OpenAPI
};

export default swaggerJsdoc(options);
