import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Phenom API',
      version: '3.0.0',
      description: `API REST et WebSocket pour l'application d'observations OVNI Phenom.

---

## � Démarrage rapide

### API REST
Tous les endpoints REST sont documentés ci-dessous avec leurs schémas de requête/réponse.

**Base URL** : \`/api/v1\`

**Authentification** : Bearer Token JWT (voir section "Authentification")

### WebSocket Temps Réel

L'API Phenom intègre un serveur WebSocket utilisant **WsMini** pour les mises à jour en temps réel.

**URLs WebSocket** :
- 🔧 **Développement** : \`ws://localhost:3000\`
- 🌐 **Production** : \`wss://phenom-backend.onrender.com\`

⚠️ **Important** : Le WebSocket utilise le **même port** que l'API REST.

---

## 🔌 Guide WebSocket

### 1️⃣ Connexion

\`\`\`javascript
// Détecter automatiquement l'environnement
const wsUrl = import.meta.env.PROD 
  ? 'wss://phenom-backend.onrender.com'
  : 'ws://localhost:3000';

const ws = new WebSocket(wsUrl);

ws.onopen = () => {
  console.log('✅ Connecté au WebSocket Phenom');
};
\`\`\`

### 2️⃣ Abonnement aux canaux

**Canal \`observations\`** - Mises à jour des observations OVNI
\`\`\`javascript
ws.send(JSON.stringify({ 
  action: 'subscribe', 
  channel: 'observations' 
}));
\`\`\`

**Événements disponibles** :
- 🆕 \`observation:created\` - Nouvelle observation publiée
- ✏️ \`observation:updated\` - Observation modifiée
- 🗑️ \`observation:deleted\` - Observation supprimée

**Canal \`comments\`** - Mises à jour des commentaires
\`\`\`javascript
ws.send(JSON.stringify({ 
  action: 'subscribe', 
  channel: 'comments' 
}));
\`\`\`

**Événements disponibles** :
- 🆕 \`comment:created\` - Nouveau commentaire posté
- ✏️ \`comment:updated\` - Commentaire modifié
- 🗑️ \`comment:deleted\` - Commentaire supprimé

### 3️⃣ Réception des messages

\`\`\`javascript
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  
  switch(message.type) {
    case 'observation:created':
      console.log('Nouvelle observation:', message.data);
      break;
    case 'comment:created':
      console.log('Nouveau commentaire:', message.data);
      break;
    // ... autres événements
  }
};
\`\`\`

### 4️⃣ Format des messages

Tous les messages WebSocket suivent ce format standardisé :

\`\`\`json
{
  "type": "observation:created",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "OVNI triangulaire",
    "description": "...",
    "location": { "type": "Point", "coordinates": [6.6323, 46.5197] },
    "userId": "507f191e810c19729de860ea",
    "createdAt": "2025-11-03T12:34:56.789Z"
  },
  "timestamp": "2025-11-03T12:34:56.789Z"
}
\`\`\`

### 5️⃣ Gestion des erreurs

\`\`\`javascript
ws.onerror = (error) => {
  console.error('❌ Erreur WebSocket:', error);
};

ws.onclose = (event) => {
  console.log('🔌 Connexion WebSocket fermée', event.code);
  // Implémenter reconnexion automatique si nécessaire
};
\`\`\`

---

## 📚 Ressources

- 📖 [Documentation technique complète](backend/src/config/WEBSOCKET_README.md)
- 🔗 [WsMini - Librairie utilisée](https://github.com/Chabloz/WsMini)
- 🔐 Note : Les clients peuvent **uniquement s'abonner** aux canaux. Seul le serveur publie des événements.
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
          description: '**Message générique WebSocket** - Format standard pour tous les événements temps réel',
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
              description: 'Données de l\'événement (observation ou commentaire complet)'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              example: '2025-11-03T12:34:56.789Z',
              description: 'Horodatage de l\'événement (ISO 8601)'
            }
          },
          required: ['type', 'data', 'timestamp'],
          example: {
            type: 'observation:created',
            data: {
              _id: '507f1f77bcf86cd799439011',
              title: 'OVNI triangulaire',
              description: 'Observation d\'un objet triangulaire lumineux',
              location: {
                type: 'Point',
                coordinates: [6.6323, 46.5197]
              },
              userId: '507f191e810c19729de860ea',
              createdAt: '2025-11-03T12:34:56.789Z'
            },
            timestamp: '2025-11-03T12:34:56.789Z'
          }
        },
        WebSocketObservationCreated: {
          type: 'object',
          description: '**WebSocket : Observation créée** - Émis lorsqu\'une nouvelle observation est publiée',
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
              format: 'date-time',
              example: '2025-11-03T12:34:56.789Z'
            }
          },
          example: {
            type: 'observation:created',
            data: {
              _id: '507f1f77bcf86cd799439011',
              title: 'OVNI triangulaire au-dessus de Genève',
              description: 'Trois lumières formant un triangle parfait',
              images: [
                {
                  imageId: '67890abcdef12345',
                  imageUrl: '/api/v1/images/67890abcdef12345',
                  size: 524288,
                  format: 'image/jpeg'
                }
              ],
              location: {
                type: 'Point',
                coordinates: [6.1432, 46.2044]
              },
              userId: '507f191e810c19729de860ea',
              createdAt: '2025-11-03T12:34:56.789Z',
              updatedAt: '2025-11-03T12:34:56.789Z'
            },
            timestamp: '2025-11-03T12:34:56.789Z'
          }
        },
        WebSocketObservationDeleted: {
          type: 'object',
          description: '**WebSocket : Observation supprimée** - Émis lorsqu\'une observation est supprimée (par l\'utilisateur ou un admin)',
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
                  example: '507f1f77bcf86cd799439011',
                  description: 'ID de l\'observation supprimée'
                }
              }
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              example: '2025-11-03T12:34:56.789Z'
            }
          },
          example: {
            type: 'observation:deleted',
            data: {
              observationId: '507f1f77bcf86cd799439011'
            },
            timestamp: '2025-11-03T12:34:56.789Z'
          }
        },
        WebSocketCommentCreated: {
          type: 'object',
          description: '**WebSocket : Commentaire créé** - Émis lorsqu\'un nouveau commentaire est posté sur une observation',
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
                  example: '507f1f77bcf86cd799439011',
                  description: 'ID de l\'observation commentée'
                }
              }
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              example: '2025-11-03T12:34:56.789Z'
            }
          },
          example: {
            type: 'comment:created',
            data: {
              comment: {
                _id: '507f1f77bcf86cd799439012',
                text: 'J\'ai vu exactement la même chose hier soir!',
                observationId: '507f1f77bcf86cd799439011',
                userId: '507f191e810c19729de860eb',
                createdAt: '2025-11-03T12:35:00.000Z'
              },
              observationId: '507f1f77bcf86cd799439011'
            },
            timestamp: '2025-11-03T12:35:00.000Z'
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
        description: `**Mises à jour en temps réel via WebSocket (WsMini)**

---

### 🔗 Connexion

**URLs** :
- Dev : \`ws://localhost:3000\`
- Prod : \`wss://phenom-backend.onrender.com\`

### 📡 Canaux disponibles

| Canal | Description | Événements |
|-------|-------------|------------|
| \`observations\` | Mises à jour des observations OVNI | \`created\`, \`updated\`, \`deleted\` |
| \`comments\` | Mises à jour des commentaires | \`created\`, \`updated\`, \`deleted\` |

### 📝 Format des messages

\`\`\`json
{
  "type": "observation:created",
  "data": { /* Observation complète */ },
  "timestamp": "2025-11-03T12:34:56.789Z"
}
\`\`\`

### 🔐 Notes importantes

- ✅ Les clients peuvent **s'abonner** (subscribe) aux canaux
- ❌ Les clients **ne peuvent pas publier** (seul le serveur publie)
- 🔄 Reconnexion automatique recommandée en cas de déconnexion

### 📚 Documentation

Consultez le guide complet dans \`backend/src/config/WEBSOCKET_README.md\`
`
      }
    ]
  },
  apis: ['./src/routes/*.js', './src/app.js'] // Chemins vers les fichiers contenant les annotations OpenAPI
};

export default swaggerJsdoc(options);
