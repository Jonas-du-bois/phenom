import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Phenom API',
      version: '1.0.0',
      description: `API REST et WebSocket pour l'application d'observations OVNI Phenom.

## 🚀 Démarrage rapide

### API REST
Tous les endpoints REST sont documentés ci-dessous avec leurs schémas de requête/réponse.

**Base URL** : \`/api/v1\`

**Authentification** : Bearer Token JWT (voir section "Authentification")
`,
      contact: {
        name: 'Équipe Phenom',
        email: 'contact@phenom.app'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT pour l\'authentification. Utilisez ce schéma pour les routes nécessitant une authentification.'
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
              description: 'Images stockées sur Cloudinary',
              items: {
                type: 'object',
                properties: {
                  publicId: {
                    type: 'string',
                    description: 'Public ID Cloudinary',
                    example: 'phenom/observations/507f1f77bcf86cd799439011_1699876543210'
                  },
                  url: {
                    type: 'string',
                    description: 'URL HTTPS publique sur Cloudinary',
                    example: 'https://res.cloudinary.com/dgsfd1fic/image/upload/v1699876543/phenom/observations/507f1f77bcf86cd799439011_1699876543210.jpg'
                  },
                  size: {
                    type: 'number',
                    description: 'Taille en octets (après compression)',
                    example: 245678
                  },
                  format: {
                    type: 'string',
                    description: 'Format de l\'image',
                    example: 'jpg'
                  },
                  width: {
                    type: 'number',
                    example: 1920
                  },
                  height: {
                    type: 'number',
                    example: 1080
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
        description: 'Gestion des images avec Cloudinary (CDN)'
      },
      {
        name: 'Administration',
        description: 'Opérations administratives (admins uniquement)'
      }
    ]
  },
  apis: ['./src/routes/*.js', './src/app.js'] // Chemins vers les fichiers contenant les annotations OpenAPI
};

export default swaggerJsdoc(options);
