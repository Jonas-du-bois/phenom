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
          description: 'Observation OVNI (format Phenom App avec support Phenom Search)',
          properties: {
            _id: {
              type: 'string'
            },
            date: {
              type: 'string',
              description: 'Date de l\'observation (YYYY-MM-DD)',
              example: '2024-03-15'
            },
            time: {
              type: 'string',
              description: 'Heure de l\'observation (HH:MM)',
              example: '22:30'
            },
            location: {
              type: 'string',
              description: 'Lieu de l\'observation',
              example: 'Lausanne, Vaud'
            },
            country: {
              type: 'string',
              example: 'Suisse'
            },
            locale: {
              type: 'string',
              description: 'Type de localité',
              enum: ['CITY', 'RURAL', 'MOUNTAIN', 'DESERT', 'OCEAN', 'FOREST', 'COAST', 'LAKE'],
              example: 'CITY'
            },
            coordinates: {
              type: 'object',
              properties: {
                lat: {
                  type: 'number',
                  example: 46.5197
                },
                lng: {
                  type: 'number',
                  example: 6.6323
                }
              }
            },
            description: {
              type: 'string',
              example: 'Observation d\'un objet triangulaire lumineux au-dessus de la ville'
            },
            credibility: {
              type: 'integer',
              description: 'Score de crédibilité (0-15)',
              minimum: 0,
              maximum: 15,
              example: 8
            },
            strangeness: {
              type: 'integer',
              description: 'Score d\'étrangeté (0-10)',
              minimum: 0,
              maximum: 10,
              example: 6
            },
            duration: {
              type: 'integer',
              description: 'Durée en secondes',
              example: 120
            },
            observerTypes: {
              type: 'array',
              description: 'Types d\'observateurs',
              items: {
                type: 'string',
                enum: ['GND', 'MIL', 'PIL', 'SCI', 'POL', 'AST', 'MTR', 'RAD']
              },
              example: ['GND', 'CIV']
            },
            ufoShapes: {
              type: 'array',
              description: 'Formes observées',
              items: {
                type: 'string',
                enum: ['SPH', 'DSK', 'TRI', 'CIG', 'LGT', 'OVL', 'RCT', 'OTH']
              },
              example: ['TRI']
            },
            phenomena: {
              type: 'array',
              description: 'Phénomènes observés',
              items: {
                type: 'string'
              },
              example: ['NTL', 'HST']
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
            userId: {
              type: 'string'
            },
            source: {
              type: 'string',
              enum: ['phenom_app', 'phenom_search_scrape'],
              example: 'phenom_app'
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
        name: 'Observations',
        description: 'Gestion des observations OVNI - Format Phenom Search compatible. Lecture publique, création/modification authentifiée.'
      },
      {
        name: 'Filters',
        description: 'Valeurs de filtres disponibles pour la recherche (pays, locales, types d\'observateurs, formes, phénomènes)'
      },
      {
        name: 'Authentication',
        description: 'Authentification et gestion de compte'
      },
      {
        name: 'Users',
        description: 'Gestion du profil utilisateur'
      },
      {
        name: 'Comments',
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
