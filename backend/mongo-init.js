// backend/mongo-init.js
// Script d'initialisation MongoDB

db = db.getSiblingDB('phenom_dev');

// Créer les collections avec validation
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['email', 'username', 'password', 'role'],
      properties: {
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
        },
        username: {
          bsonType: 'string',
          minLength: 3,
          maxLength: 30
        },
        password: {
          bsonType: 'string'
        },
        role: {
          enum: ['user', 'admin']
        }
      }
    }
  }
});

db.createCollection('observations', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['title', 'description', 'location', 'userId', 'createdAt'],
      properties: {
        title: {
          bsonType: 'string',
          minLength: 5,
          maxLength: 200
        },
        description: {
          bsonType: 'string',
          minLength: 10
        },
        location: {
          bsonType: 'object',
          required: ['type', 'coordinates'],
          properties: {
            type: {
              enum: ['Point']
            },
            coordinates: {
              bsonType: 'array'
            }
          }
        },
        photoUrl: {
          bsonType: 'string'
        },
        userId: {
          bsonType: 'objectId'
        },
        status: {
          enum: ['pending', 'approved', 'rejected']
        }
      }
    }
  }
});

db.createCollection('comments');

// Créer les index
db.users.createIndex({ 'email': 1 }, { unique: true });
db.observations.createIndex({ 'location': '2dsphere' });
db.observations.createIndex({ 'userId': 1, 'createdAt': -1 });
db.observations.createIndex({ 'title': 'text', 'description': 'text' });
db.comments.createIndex({ 'observationId': 1, 'createdAt': -1 });

print('✅ Collections et index créés avec succès');

// Créer un utilisateur admin par défaut (développement seulement)
if (db.getName() === 'phenom_dev') {
  // Hash bcrypt du mot de passe 'admin123'
  const adminUser = {
    email: 'admin@phenom.com',
    username: 'admin',
    password: '$2a$10$XqHzJ3YKvKLKVzKCGxLQYe4pxKp7YCl5hVWQXJPvqLqXNKZPKXQYq',
    role: 'admin',
    createdAt: new Date()
  };
  
  db.users.insertOne(adminUser);
  print('✅ Utilisateur admin créé (email: admin@phenom.com, password: admin123)');
}
