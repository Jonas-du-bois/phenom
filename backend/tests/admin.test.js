import request from 'supertest';
import { jest } from '@jest/globals';
import app from '../src/app.js';
import User from '../src/models/User.js';
import Observation from '../src/models/Observation.js';
import Comment from '../src/models/Comment.js';

/**
 * Tests des endpoints admin
 * Couvre la gestion des utilisateurs, observations, commentaires et statistiques
 */
describe('Admin Endpoints', () => {
  let adminToken;
  let adminId;
  let regularUserId;
  let regularUserToken;
  let observationId;
  let commentId;

  // Helper pour créer et authentifier un utilisateur
  const createAuthenticatedUser = async (role = 'viewer') => {
    const userData = {
      name: `Test ${role}`,
      email: `test-${role}-${Date.now()}@example.com`,
      password: 'Password123!',
      role: role
    };

    const user = await User.create(userData);

    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: userData.email, password: userData.password });

    return {
      userId: user._id,
      token: loginResponse.body.data.accessToken,
      user
    };
  };

  beforeEach(async () => {
    // Créer admin et utilisateur régulier
    const admin = await createAuthenticatedUser('admin');
    adminToken = admin.token;
    adminId = admin.userId;

    const regular = await createAuthenticatedUser('viewer');
    regularUserToken = regular.token;
    regularUserId = regular.userId;

    // Créer une observation
    const observation = await Observation.create({
      title: 'Test Observation',
      description: 'Description for testing',
      date: new Date(),
      location: {
        type: 'Point',
        coordinates: [2.3522, 48.8566]
      },
      type: 'Lumière',
      status: 'pending',
      userId: regularUserId
    });
    observationId = observation._id;

    // Créer un commentaire
    const comment = await Comment.create({
      text: 'Test comment',
      observationId,
      userId: regularUserId
    });
    commentId = comment._id;
  });

  afterEach(async () => {
    await User.deleteMany({});
    await Observation.deleteMany({});
    await Comment.deleteMany({});
  });

  describe('GET /api/v1/admin/users', () => {
    it('should get all users as admin', async () => {
      const response = await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/v1/admin/users?page=1&limit=1')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.limit).toBe(1);
    });

    it('should fail without admin role', async () => {
      await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(403);
    });

    it('should fail without authentication', async () => {
      await request(app)
        .get('/api/v1/admin/users')
        .expect(401);
    });
  });

  describe('GET /api/v1/admin/users/:id', () => {
    it('should get user details as admin', async () => {
      const response = await request(app)
        .get(`/api/v1/admin/users/${regularUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(regularUserId.toString());
    });

    it('should return 404 for non-existent user', async () => {
      await request(app)
        .get('/api/v1/admin/users/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should fail without admin role', async () => {
      await request(app)
        .get(`/api/v1/admin/users/${regularUserId}`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(403);
    });
  });

  describe('PUT /api/v1/admin/users/:id/role', () => {
    it('should update user role as admin', async () => {
      const response = await request(app)
        .put(`/api/v1/admin/users/${regularUserId}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'admin' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.role).toBe('admin');
    });

    it('should fail with invalid role', async () => {
      await request(app)
        .put(`/api/v1/admin/users/${regularUserId}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'invalid-role' })
        .expect(400);
    });

    it('should fail without admin role', async () => {
      await request(app)
        .put(`/api/v1/admin/users/${regularUserId}/role`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send({ role: 'admin' })
        .expect(403);
    });

    it('should return 404 for non-existent user', async () => {
      await request(app)
        .put('/api/v1/admin/users/507f1f77bcf86cd799439011/role')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'admin' })
        .expect(404);
    });
  });

  describe('POST /api/v1/admin/users/:id/suspend', () => {
    it('should suspend user as admin', async () => {
      const response = await request(app)
        .post(`/api/v1/admin/users/${regularUserId}/suspend`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      
      // Vérifier que l'utilisateur est suspendu
      const user = await User.findById(regularUserId);
      expect(user.status).toBe('suspended');
    });

    it('should fail without admin role', async () => {
      await request(app)
        .post(`/api/v1/admin/users/${regularUserId}/suspend`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(403);
    });

    it('should return 404 for non-existent user', async () => {
      await request(app)
        .post('/api/v1/admin/users/507f1f77bcf86cd799439011/suspend')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  describe('POST /api/v1/admin/users/:id/activate', () => {
    beforeEach(async () => {
      // Suspendre l'utilisateur d'abord
      await User.findByIdAndUpdate(regularUserId, { status: 'suspended' });
    });

    it('should activate suspended user as admin', async () => {
      const response = await request(app)
        .post(`/api/v1/admin/users/${regularUserId}/activate`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      
      // Vérifier que l'utilisateur est activé
      const user = await User.findById(regularUserId);
      expect(user.status).toBe('active');
    });

    it('should fail without admin role', async () => {
      await request(app)
        .post(`/api/v1/admin/users/${regularUserId}/activate`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(403);
    });

    it('should return 404 for non-existent user', async () => {
      await request(app)
        .post('/api/v1/admin/users/507f1f77bcf86cd799439011/activate')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  describe('GET /api/v1/admin/observations', () => {
    it('should get all observations as admin', async () => {
      const response = await request(app)
        .get('/api/v1/admin/observations')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('should support status filter', async () => {
      const response = await request(app)
        .get('/api/v1/admin/observations?status=pending')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      if (response.body.data.length > 0) {
        expect(response.body.data[0].status).toBe('pending');
      }
    });

    it('should fail without admin role', async () => {
      await request(app)
        .get('/api/v1/admin/observations')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(403);
    });
  });

  describe('POST /api/v1/admin/observations/:id/approve', () => {
    it('should approve observation as admin', async () => {
      const response = await request(app)
        .post(`/api/v1/admin/observations/${observationId}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      
      // Vérifier que l'observation est approuvée
      const observation = await Observation.findById(observationId);
      expect(observation.status).toBe('approved');
    });

    it('should fail without admin role', async () => {
      await request(app)
        .post(`/api/v1/admin/observations/${observationId}/approve`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(403);
    });

    it('should return 404 for non-existent observation', async () => {
      await request(app)
        .post('/api/v1/admin/observations/507f1f77bcf86cd799439011/approve')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  describe('POST /api/v1/admin/observations/:id/reject', () => {
    it('should reject observation as admin', async () => {
      const response = await request(app)
        .post(`/api/v1/admin/observations/${observationId}/reject`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      
      // Vérifier que l'observation est rejetée
      const observation = await Observation.findById(observationId);
      expect(observation.status).toBe('rejected');
    });

    it('should fail without admin role', async () => {
      await request(app)
        .post(`/api/v1/admin/observations/${observationId}/reject`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(403);
    });

    it('should return 404 for non-existent observation', async () => {
      await request(app)
        .post('/api/v1/admin/observations/507f1f77bcf86cd799439011/reject')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  describe('DELETE /api/v1/admin/observations/:id', () => {
    it('should delete observation as admin', async () => {
      await request(app)
        .delete(`/api/v1/admin/observations/${observationId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);

      // Vérifier que l'observation est supprimée
      const observation = await Observation.findById(observationId);
      expect(observation).toBeNull();
    });

    it('should fail without admin role', async () => {
      await request(app)
        .delete(`/api/v1/admin/observations/${observationId}`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(403);
    });

    it('should return 404 for non-existent observation', async () => {
      await request(app)
        .delete('/api/v1/admin/observations/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  describe('GET /api/v1/admin/comments', () => {
    it('should get all comments as admin', async () => {
      const response = await request(app)
        .get('/api/v1/admin/comments')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('should fail without admin role', async () => {
      await request(app)
        .get('/api/v1/admin/comments')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(403);
    });
  });

  describe('DELETE /api/v1/admin/comments/:id', () => {
    it('should delete comment as admin', async () => {
      await request(app)
        .delete(`/api/v1/admin/comments/${commentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);

      // Vérifier que le commentaire est supprimé
      const comment = await Comment.findById(commentId);
      expect(comment).toBeNull();
    });

    it('should fail without admin role', async () => {
      await request(app)
        .delete(`/api/v1/admin/comments/${commentId}`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(403);
    });

    it('should return 404 for non-existent comment', async () => {
      await request(app)
        .delete('/api/v1/admin/comments/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  describe('GET /api/v1/admin/stats', () => {
    it('should get global statistics as admin', async () => {
      const response = await request(app)
        .get('/api/v1/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      
      // Vérifier la structure des stats
      const stats = response.body.data;
      expect(stats).toHaveProperty('totalUsers');
      expect(stats).toHaveProperty('totalObservations');
      expect(stats).toHaveProperty('totalComments');
      expect(stats).toHaveProperty('recentObservations');
      expect(stats).toHaveProperty('topContributors');
    });

    it('should fail without admin role', async () => {
      await request(app)
        .get('/api/v1/admin/stats')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(403);
    });
  });

  describe('Security and Edge Cases', () => {
    it('should not expose sensitive user data', async () => {
      const response = await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const users = response.body.data;
      users.forEach(user => {
        expect(user).not.toHaveProperty('password');
      });
    });
  });
});
