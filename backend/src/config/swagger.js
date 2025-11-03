import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Phenom API',
      version: '3.0.0',
      description: `API REST et WebSocket pour l'application d'observations OVNI Phenom

## 🔌 WebSocket en temps réel

L'API Phenom intègre maintenant un serveur WebSocket utilisant **WsMini** pour les mises à jour en temps réel.

### Connexion WebSocket

**URL du serveur WebSocket** : \`ws://localhost:8888\` (développement)

Pour vous connecter depuis le frontend :

\`\`\`javascript
import { WSClient } from 'wsmini';

const ws = new WSClient('ws://localhost:8888');
await ws.connect();
\`\`\`

### Canaux disponibles

#### 📡 Canal \`observations\`
Recevez les mises à jour en temps réel sur les observations :

\`\`\`javascript
await ws.sub('observations', (message) => {
  console.log('Événement reçu:', message);
  // message.type peut être :
  // - 'observation:created' : Nouvelle observation
  // - 'observation:updated' : Observation modifiée
  // - 'observation:deleted' : Observation supprimée
});
\`\`\`

#### 💬 Canal \`comments\`
Recevez les mises à jour en temps réel sur les commentaires :

\`\`\`javascript
await ws.sub('comments', (message) => {
  console.log('Événement reçu:', message);
  // message.type peut être :
  // - 'comment:created' : Nouveau commentaire
  // - 'comment:updated' : Commentaire modifié
  // - 'comment:deleted' : Commentaire supprimé
});
\`\`\`

### Format des messages

Tous les messages WebSocket suivent ce format :

\`\`\`json
{
  "type": "observation:created|updated|deleted",
  "data": { /* Données de l'observation ou commentaire */ },
  "timestamp": "2025-11-03T12:34:56.789Z"
}
\`\`\`

### Documentation complète

Pour plus d'informations sur l'implémentation WebSocket, consultez :
- \`backend/src/config/WEBSOCKET_README.md\`
- [Documentation WsMini](https://github.com/Chabloz/WsMini)
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
        },
        WebSocketMessage: {
          type: 'object',
          description: 'Format des messages WebSocket reçus en temps réel',
          properties: {
            type: {
              type: 'string',
              enum: [
                'observation:created',
                'observation:updated',
                'observation:deleted',
                'comment:created',
                'comment:updated',
                'comment:deleted'
              ],
              example: 'observation:created',
              description: 'Type d\'événement WebSocket'
            },
            data: {
              type: 'object',
              description: 'Données de l\'événement (observation ou commentaire)'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              example: '2025-11-03T12:34:56.789Z',
              description: 'Horodatage de l\'événement'
            }
          },
          required: ['type', 'data', 'timestamp']
        },
        WebSocketObservationCreated: {
          type: 'object',
          description: 'Message WebSocket pour une observation créée',
          properties: {
            type: {
              type: 'string',
              enum: ['observation:created'],
              example: 'observation:created'
            },
            data: {
              $ref: '#/components/schemas/Observation'
            },
            timestamp: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        WebSocketObservationDeleted: {
          type: 'object',
          description: 'Message WebSocket pour une observation supprimée',
          properties: {
            type: {
              type: 'string',
              enum: ['observation:deleted'],
              example: 'observation:deleted'
            },
            data: {
              type: 'object',
              properties: {
                observationId: {
                  type: 'string',
                  example: '507f1f77bcf86cd799439011'
                }
              }
            },
            timestamp: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        WebSocketCommentCreated: {
          type: 'object',
          description: 'Message WebSocket pour un commentaire créé',
          properties: {
            type: {
              type: 'string',
              enum: ['comment:created'],
              example: 'comment:created'
            },
            data: {
              type: 'object',
              properties: {
                comment: {
                  $ref: '#/components/schemas/Comment'
                },
                observationId: {
                  type: 'string',
                  example: '507f1f77bcf86cd799439011'
                }
              }
            },
            timestamp: {
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
      },
      {
        name: 'WebSocket',
        description: `Mises à jour en temps réel via WebSocket (WsMini)
        
**Serveur WebSocket** : ws://localhost:8888

**Canaux disponibles** :
- \`observations\` : Événements sur les observations (créer, modifier, supprimer)
- \`comments\` : Événements sur les commentaires (créer, modifier, supprimer)

**Note** : Les clients peuvent uniquement s'abonner (subscribe) aux canaux. Seul le serveur peut publier des événements.`
      }
    ]
  },
  apis: ['./src/routes/*.js', './src/app.js'] // Chemins vers les fichiers contenant les annotations OpenAPI
};

export default swaggerJsdoc(options);
