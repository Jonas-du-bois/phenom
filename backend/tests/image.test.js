import request from 'supertest';
import app from '../src/app.js';
import mongoose from 'mongoose';
import User from '../src/models/User.js';
import Observation from '../src/models/Observation.js';
import { getGridFSBucket } from '../src/config/gridfs.js';

describe('Image Controller', () => {
  let adminToken;
  let userToken;
  let adminId;
  let userId;
  let observationId;
  let imageId;

  // Helper pour créer un buffer d'image de test
  const createTestImageBuffer = () => {
    // PNG 1x1 transparent minimal valide
    return Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );
  };

  // Helper pour créer un utilisateur authentifié
  const createAuthenticatedUser = async (email, password, role = 'viewer') => {
    const user = await User.create({
      name: `User ${email}`,
      email,
      password,
      role // Set role during creation
    });

    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({ email, password });

    if (!loginResponse.body || !loginResponse.body.data) {
      throw new Error(`Login failed: ${JSON.stringify(loginResponse.body)}`);
    }

    return {
      user,
      token: loginResponse.body.data.accessToken
    };
  };

  beforeEach(async () => {
    // Créer un admin
    const admin = await createAuthenticatedUser(`admin${Date.now()}@test.com`, 'Admin123!', 'admin');
    adminId = admin.user._id.toString();
    adminToken = admin.token;

    // Créer un utilisateur normal
    const user = await createAuthenticatedUser(`user${Date.now()}@test.com`, 'User123!', 'viewer');
    userId = user.user._id.toString();
    userToken = user.token;

    // Créer une observation de test
    const observation = await Observation.create({
      title: 'Observation Test Image',
      description: 'Description de test pour l\'upload d\'images',
      userId: userId,
      location: {
        type: 'Point',
        coordinates: [2.3522, 48.8566]
      },
      images: []
    });
    observationId = observation._id.toString();
  });

  afterEach(async () => {
    // Nettoyer la base de données
    await User.deleteMany({});
    await Observation.deleteMany({});

    // Nettoyer GridFS
    try {
      const bucket = getGridFSBucket();
      const files = await bucket.find({}).toArray();
      for (const file of files) {
        await bucket.delete(file._id);
      }
    } catch (error) {
      console.error('Erreur nettoyage GridFS:', error.message);
    }
  });

  describe('POST /api/v1/observations/:observationId/images', () => {
    it('devrait uploader une image avec succès', async () => {
      const imageBuffer = createTestImageBuffer();

      const res = await request(app)
        .post(`/api/v1/observations/${observationId}/images`)
        .set('Authorization', `Bearer ${userToken}`)
        .attach('image', imageBuffer, { filename: 'test.png', contentType: 'image/png' });

      if (res.status !== 201) {
        console.log('Error response:', res.body);
      }

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data).toHaveProperty('url');
      expect(res.body.data).toHaveProperty('filename');
      expect(res.body.data.filename).toBe('test.png');

      imageId = res.body.data.id;

      // Vérifier que l'image a été ajoutée à l'observation
      const observation = await Observation.findById(observationId);
      const imageIds = observation.images.map(img => img.imageId);
      expect(imageIds).toContainEqual(imageId);
    });

    it('devrait accepter une image JPEG', async () => {
      // JPEG 1x1 minimal valide
      const jpegBuffer = Buffer.from(
        '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k=',
        'base64'
      );

      const res = await request(app)
        .post(`/api/v1/observations/${observationId}/images`)
        .set('Authorization', `Bearer ${userToken}`)
        .attach('image', jpegBuffer, { filename: 'test.jpg', contentType: 'image/jpeg' });

      expect(res.status).toBe(201);
      expect(res.body.data.filename).toBe('test.jpg');
    });

    it('devrait refuser si aucun fichier n\'est fourni', async () => {
      const res = await request(app)
        .post(`/api/v1/observations/${observationId}/images`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Aucune image fournie');
    });

    it('devrait refuser si l\'observation n\'existe pas', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const imageBuffer = createTestImageBuffer();

      const res = await request(app)
        .post(`/api/v1/observations/${fakeId}/images`)
        .set('Authorization', `Bearer ${userToken}`)
        .attach('image', imageBuffer, 'test.png');

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Observation non trouvée');
    });

    it('devrait refuser si l\'utilisateur n\'est pas le propriétaire', async () => {
      // Créer une observation appartenant à l'admin
      const adminObservation = await Observation.create({
        title: 'Admin Observation',
        description: 'Observation de test pour l\'admin avec description suffisamment longue',
        userId: adminId,
        location: {
          type: 'Point',
          coordinates: [2.3522, 48.8566]
        },
        images: []
      });

      const imageBuffer = createTestImageBuffer();

      const res = await request(app)
        .post(`/api/v1/observations/${adminObservation._id}/images`)
        .set('Authorization', `Bearer ${userToken}`)
        .attach('image', imageBuffer, 'test.png');

      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Non autorisé');

      // Nettoyer
      await Observation.findByIdAndDelete(adminObservation._id);
    });

    it('devrait refuser sans authentification', async () => {
      const imageBuffer = createTestImageBuffer();

      const res = await request(app)
        .post(`/api/v1/observations/${observationId}/images`)
        .attach('image', imageBuffer, 'test.png');

      expect(res.status).toBe(401);
    });

    it('devrait refuser avec un token invalide', async () => {
      const imageBuffer = createTestImageBuffer();

      const res = await request(app)
        .post(`/api/v1/observations/${observationId}/images`)
        .set('Authorization', 'Bearer invalid_token')
        .attach('image', imageBuffer, 'test.png');

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/v1/images/:imageId', () => {
    beforeEach(async () => {
      // Uploader une image avant chaque test de récupération
      const imageBuffer = createTestImageBuffer();

      const res = await request(app)
        .post(`/api/v1/observations/${observationId}/images`)
        .set('Authorization', `Bearer ${userToken}`)
        .attach('image', imageBuffer, { filename: 'test-get.png', contentType: 'image/png' });

      imageId = res.body.data.id;
    });

    it('devrait récupérer une image par son ID', async () => {
      const res = await request(app)
        .get(`/api/v1/images/${imageId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/image\//);
      expect(res.headers['content-disposition']).toContain('test-get.png');
      expect(res.body).toBeInstanceOf(Buffer);
    });

    it('devrait permettre à n\'importe quel utilisateur authentifié de voir une image', async () => {
      const res = await request(app)
        .get(`/api/v1/images/${imageId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/image\//);
    });

    it('devrait retourner 404 si l\'image n\'existe pas', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();

      const res = await request(app)
        .get(`/api/v1/images/${fakeId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Image non trouvée');
    });

    it('devrait retourner 400 pour un ID invalide', async () => {
      const res = await request(app)
        .get('/api/v1/images/invalid_id')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(400);
    });

    it('devrait refuser sans authentification', async () => {
      const res = await request(app)
        .get(`/api/v1/images/${imageId}`);

      expect(res.status).toBe(401);
    });
  });

  describe('DELETE /api/v1/observations/:observationId/images/:imageId', () => {
    beforeEach(async () => {
      // Uploader une image avant chaque test de suppression
      const imageBuffer = createTestImageBuffer();

      const res = await request(app)
        .post(`/api/v1/observations/${observationId}/images`)
        .set('Authorization', `Bearer ${userToken}`)
        .attach('image', imageBuffer, { filename: 'test-delete.png', contentType: 'image/png' });

      imageId = res.body.data.id;
    });

    it('devrait supprimer une image avec succès', async () => {
      const res = await request(app)
        .delete(`/api/v1/observations/${observationId}/images/${imageId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Image supprimée avec succès');

      // Vérifier que l'image a été retirée de l'observation
      const observation = await Observation.findById(observationId);
      const imageIds = observation.images.map(img => img.imageId);
      expect(imageIds).not.toContainEqual(imageId);

      // Vérifier que l'image n'existe plus dans GridFS
      const bucket = getGridFSBucket();
      const files = await bucket.find({ _id: new mongoose.Types.ObjectId(imageId) }).toArray();
      expect(files).toHaveLength(0);
    });

    it('devrait permettre à un admin de supprimer n\'importe quelle image', async () => {
      const res = await request(app)
        .delete(`/api/v1/observations/${observationId}/images/${imageId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });

    it('devrait refuser si l\'utilisateur n\'est pas le propriétaire', async () => {
      // Créer une observation appartenant à l'admin avec une image
      const adminObservation = await Observation.create({
        title: 'Admin Observation Delete',
        description: 'Observation de test pour suppression par l\'admin avec description longue',
        userId: adminId,
        location: {
          type: 'Point',
          coordinates: [2.3522, 48.8566]
        },
        images: []
      });

      const imageBuffer = createTestImageBuffer();
      const uploadRes = await request(app)
        .post(`/api/v1/observations/${adminObservation._id}/images`)
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('image', imageBuffer, { filename: 'admin-image.png', contentType: 'image/png' });

      const adminImageId = uploadRes.body.data.id;

      // Essayer de supprimer avec le token user
      const res = await request(app)
        .delete(`/api/v1/observations/${adminObservation._id}/images/${adminImageId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Non autorisé');

      // Nettoyer
      await request(app)
        .delete(`/api/v1/observations/${adminObservation._id}/images/${adminImageId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      await Observation.findByIdAndDelete(adminObservation._id);
    });

    it('devrait retourner 404 si l\'observation n\'existe pas', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();

      const res = await request(app)
        .delete(`/api/v1/observations/${fakeId}/images/${imageId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Observation non trouvée');
    });

    it('devrait retourner 404 si l\'image n\'existe pas', async () => {
      const fakeImageId = new mongoose.Types.ObjectId().toString();

      const res = await request(app)
        .delete(`/api/v1/observations/${observationId}/images/${fakeImageId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Image non trouvée');
    });

    it('devrait refuser sans authentification', async () => {
      const res = await request(app)
        .delete(`/api/v1/observations/${observationId}/images/${imageId}`);

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/v1/observations/:observationId/images', () => {
    beforeEach(async () => {
      // Uploader plusieurs images pour les tests de listing
      const imageBuffer1 = createTestImageBuffer();
      const imageBuffer2 = createTestImageBuffer();

      await request(app)
        .post(`/api/v1/observations/${observationId}/images`)
        .set('Authorization', `Bearer ${userToken}`)
        .attach('image', imageBuffer1, 'list-test-1.png');

      await request(app)
        .post(`/api/v1/observations/${observationId}/images`)
        .set('Authorization', `Bearer ${userToken}`)
        .attach('image', imageBuffer2, 'list-test-2.png');
    });

    it('devrait lister toutes les images d\'une observation', async () => {
      const res = await request(app)
        .get(`/api/v1/observations/${observationId}/images`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.data[0]).toHaveProperty('id');
      expect(res.body.data[0]).toHaveProperty('url');
      expect(res.body.data[0]).toHaveProperty('filename');
      expect(res.body.data[0]).toHaveProperty('size');
      expect(res.body.data[0]).toHaveProperty('uploadedAt');
    });

    it('devrait retourner un tableau vide si aucune image', async () => {
      // Créer une nouvelle observation sans images
      const emptyObservation = await Observation.create({
        title: 'Empty Observation',
        description: 'Observation vide sans images pour les tests de listing',
        userId: userId,
        location: {
          type: 'Point',
          coordinates: [2.3522, 48.8566]
        },
        images: []
      });

      const res = await request(app)
        .get(`/api/v1/observations/${emptyObservation._id}/images`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data).toHaveLength(0);

      // Nettoyer
      await Observation.findByIdAndDelete(emptyObservation._id);
    });

    it('devrait retourner 404 si l\'observation n\'existe pas', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();

      const res = await request(app)
        .get(`/api/v1/observations/${fakeId}/images`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Observation non trouvée');
    });

    it('devrait permettre à n\'importe quel utilisateur authentifié de lister les images', async () => {
      const res = await request(app)
        .get(`/api/v1/observations/${observationId}/images`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
    });

    it('devrait refuser sans authentification', async () => {
      const res = await request(app)
        .get(`/api/v1/observations/${observationId}/images`);

      expect(res.status).toBe(401);
    });
  });
});
