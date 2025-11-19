/**
 * Tests pour vérifier la suppression en cascade des observations
 * Ces tests vérifient que toutes les données associées sont correctement supprimées
 */

import request from 'supertest';
import app from '../src/app.js';
import User from '../src/models/User.js';
import Observation from '../src/models/Observation.js';
import Comment from '../src/models/Comment.js';
import mongoose from 'mongoose';
import imageService from '../src/services/image.service.js';

// Mock du service d'images pour éviter les appels réels à Cloudinary
jest.mock('../src/services/image.service.js', () => ({
  default: {
    deleteAllImagesForObservation: jest.fn().mockResolvedValue(2),
    deleteMultipleImages: jest.fn().mockResolvedValue(2)
  }
}));

describe('Tests de suppression en cascade des observations', () => {
  let authToken;
  let adminToken;
  let userId;
  let adminId;
  let observationId;

  beforeAll(async () => {
    // Créer un utilisateur de test
    const userRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Cascade User',
        email: 'cascade@test.com',
        password: 'Password123!'
      });

    authToken = userRes.body.data.token;
    userId = userRes.body.data.user.id;

    // Créer un admin de test
    const adminRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Cascade Admin',
        email: 'cascadeadmin@test.com',
        password: 'Admin123!'
      });

    adminId = adminRes.body.data.user.id;
    await User.findByIdAndUpdate(adminId, { role: 'admin' });

    const adminLoginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'cascadeadmin@test.com',
        password: 'Admin123!'
      });

    adminToken = adminLoginRes.body.data.token;
  });

  beforeEach(() => {
    // Réinitialiser les mocks avant chaque test
    jest.clearAllMocks();
  });

  describe('Suppression d\'observation par l\'utilisateur', () => {
    beforeEach(async () => {
      // Créer une observation de test
      const obsRes = await request(app)
        .post('/api/observations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Observation avec cascade',
          description: 'Test de suppression en cascade',
          type: 'WAV',
          location: {
            type: 'Point',
            coordinates: [2.3522, 48.8566]
          },
          address: 'Paris, France'
        });

      observationId = obsRes.body.data._id;

      // Ajouter des commentaires à l'observation
      await request(app)
        .post('/api/comments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          observationId,
          text: 'Premier commentaire de test'
        });

      await request(app)
        .post('/api/comments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          observationId,
          text: 'Deuxième commentaire de test'
        });
    });

    it('devrait supprimer l\'observation, ses commentaires et ses images Cloudinary', async () => {
      // Vérifier que l'observation existe avec ses commentaires
      const observation = await Observation.findById(observationId);
      expect(observation).toBeTruthy();

      const commentsBefore = await Comment.find({ observationId });
      expect(commentsBefore).toHaveLength(2);

      // Supprimer l'observation
      const res = await request(app)
        .delete(`/api/observations/${observationId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Vérifier que l'observation est supprimée
      const deletedObservation = await Observation.findById(observationId);
      expect(deletedObservation).toBeNull();

      // Vérifier que les commentaires sont supprimés
      const commentsAfter = await Comment.find({ observationId });
      expect(commentsAfter).toHaveLength(0);

      // Vérifier que le service d'images a été appelé
      expect(imageService.deleteAllImagesForObservation).toHaveBeenCalledWith(observationId);
    });

    it('devrait gérer la suppression même si Cloudinary échoue', async () => {
      // Simuler une erreur Cloudinary
      imageService.deleteAllImagesForObservation.mockRejectedValueOnce(
        new Error('Cloudinary service unavailable')
      );

      // Supprimer l'observation
      const res = await request(app)
        .delete(`/api/observations/${observationId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);

      // Vérifier que l'observation et les commentaires sont quand même supprimés
      const deletedObservation = await Observation.findById(observationId);
      expect(deletedObservation).toBeNull();

      const commentsAfter = await Comment.find({ observationId });
      expect(commentsAfter).toHaveLength(0);

      // Le service d'images devrait avoir été appelé malgré l'erreur
      expect(imageService.deleteAllImagesForObservation).toHaveBeenCalledWith(observationId);
    });
  });

  describe('Suppression d\'observation par l\'admin', () => {
    beforeEach(async () => {
      // Créer une observation de test
      const obsRes = await request(app)
        .post('/api/observations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Observation admin cascade',
          description: 'Test de suppression admin',
          type: 'OBS',
          location: {
            type: 'Point',
            coordinates: [2.3522, 48.8566]
          },
          address: 'Paris, France'
        });

      observationId = obsRes.body.data._id;

      // Ajouter un commentaire
      await request(app)
        .post('/api/comments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          observationId,
          text: 'Commentaire pour test admin'
        });
    });

    it('devrait supprimer l\'observation, commentaires et images via admin', async () => {
      // Supprimer via l'endpoint admin
      const res = await request(app)
        .delete(`/api/admin/observations/${observationId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);

      // Vérifier suppression complète
      const deletedObservation = await Observation.findById(observationId);
      expect(deletedObservation).toBeNull();

      const commentsAfter = await Comment.find({ observationId });
      expect(commentsAfter).toHaveLength(0);

      // Vérifier que les images Cloudinary sont supprimées (fix du bug)
      expect(imageService.deleteAllImagesForObservation).toHaveBeenCalledWith(observationId);
    });
  });

  describe('Suppression de compte utilisateur', () => {
    let testUserId;
    let testUserToken;
    let obs1Id, obs2Id;

    beforeEach(async () => {
      // Créer un utilisateur temporaire
      const userRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Temp User',
          email: 'tempuser@test.com',
          password: 'Password123!'
        });

      testUserToken = userRes.body.data.token;
      testUserId = userRes.body.data.user.id;

      // Créer plusieurs observations
      const obs1 = await request(app)
        .post('/api/observations')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          title: 'Observation 1',
          description: 'Première observation',
          type: 'WAV',
          location: { type: 'Point', coordinates: [2.3522, 48.8566] },
          address: 'Paris'
        });
      obs1Id = obs1.body.data._id;

      const obs2 = await request(app)
        .post('/api/observations')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          title: 'Observation 2',
          description: 'Deuxième observation',
          type: 'LND',
          location: { type: 'Point', coordinates: [2.3522, 48.8566] },
          address: 'Paris'
        });
      obs2Id = obs2.body.data._id;

      // Ajouter des commentaires
      await request(app)
        .post('/api/comments')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          observationId: obs1Id,
          text: 'Commentaire obs 1'
        });

      await request(app)
        .post('/api/comments')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          observationId: obs2Id,
          text: 'Commentaire obs 2'
        });
    });

    it('devrait supprimer le compte et toutes ses observations/commentaires/images', async () => {
      // Vérifier l'état initial
      const userBefore = await User.findById(testUserId);
      expect(userBefore).toBeTruthy();

      const obsBefore = await Observation.find({ userId: testUserId });
      expect(obsBefore).toHaveLength(2);

      const commentsBefore = await Comment.find({ userId: testUserId });
      expect(commentsBefore).toHaveLength(2);

      // Supprimer le compte
      const res = await request(app)
        .delete('/api/users/account')
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(res.status).toBe(200);

      // Vérifier que l'utilisateur est supprimé
      const userAfter = await User.findById(testUserId);
      expect(userAfter).toBeNull();

      // Vérifier que toutes les observations sont supprimées
      const obsAfter = await Observation.find({ userId: testUserId });
      expect(obsAfter).toHaveLength(0);

      // Vérifier que tous les commentaires sont supprimés
      const commentsAfter = await Comment.find({ userId: testUserId });
      expect(commentsAfter).toHaveLength(0);

      // Vérifier que les images Cloudinary ont été supprimées pour chaque observation
      expect(imageService.deleteAllImagesForObservation).toHaveBeenCalledTimes(2);
      expect(imageService.deleteAllImagesForObservation).toHaveBeenCalledWith(obs1Id);
      expect(imageService.deleteAllImagesForObservation).toHaveBeenCalledWith(obs2Id);
    });

    it('devrait gérer la suppression même si Cloudinary échoue partiellement', async () => {
      // Simuler une erreur Cloudinary
      imageService.deleteAllImagesForObservation.mockRejectedValueOnce(
        new Error('Cloudinary error for first observation')
      );

      // Supprimer le compte
      const res = await request(app)
        .delete('/api/users/account')
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(res.status).toBe(200);

      // Vérifier que tout est quand même supprimé de MongoDB
      const userAfter = await User.findById(testUserId);
      expect(userAfter).toBeNull();

      const obsAfter = await Observation.find({ userId: testUserId });
      expect(obsAfter).toHaveLength(0);

      const commentsAfter = await Comment.find({ userId: testUserId });
      expect(commentsAfter).toHaveLength(0);
    });
  });

  describe('Intégrité référentielle', () => {
    it('ne devrait PAS supprimer l\'utilisateur quand on supprime son observation', async () => {
      // Créer une observation
      const obsRes = await request(app)
        .post('/api/observations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test intégrité',
          description: 'Test',
          type: 'SUB',
          location: { type: 'Point', coordinates: [2.3522, 48.8566] },
          address: 'Paris'
        });

      const obsId = obsRes.body.data._id;

      // Supprimer l'observation
      await request(app)
        .delete(`/api/observations/${obsId}`)
        .set('Authorization', `Bearer ${authToken}`);

      // Vérifier que l'utilisateur existe toujours
      const user = await User.findById(userId);
      expect(user).toBeTruthy();
      expect(user.name).toBe('Cascade User');
    });

    it('ne devrait PAS supprimer l\'auteur d\'un commentaire quand on supprime l\'observation', async () => {
      // Créer une observation et un commentaire
      const obsRes = await request(app)
        .post('/api/observations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test commentaire',
          description: 'Test',
          type: 'RAY',
          location: { type: 'Point', coordinates: [2.3522, 48.8566] },
          address: 'Paris'
        });

      const obsId = obsRes.body.data._id;

      await request(app)
        .post('/api/comments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          observationId: obsId,
          text: 'Mon commentaire'
        });

      // Supprimer l'observation
      await request(app)
        .delete(`/api/observations/${obsId}`)
        .set('Authorization', `Bearer ${authToken}`);

      // Vérifier que l'utilisateur existe toujours
      const user = await User.findById(userId);
      expect(user).toBeTruthy();
    });
  });

  afterAll(async () => {
    // Nettoyer les utilisateurs de test
    await User.deleteMany({
      email: { $in: ['cascade@test.com', 'cascadeadmin@test.com', 'tempuser@test.com'] }
    });

    // Nettoyer toutes les observations de test
    await Observation.deleteMany({
      userId: { $in: [userId, adminId] }
    });

    // Nettoyer tous les commentaires de test
    await Comment.deleteMany({
      userId: { $in: [userId, adminId] }
    });

    await mongoose.connection.close();
  });
});
