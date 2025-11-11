# Security Implementation Guide

This guide provides step-by-step instructions for implementing the remaining high-priority security features identified in the security audit.

## Table of Contents

1. [WebSocket Authentication](#websocket-authentication)
2. [Account Lockout Mechanism](#account-lockout-mechanism)
3. [Refresh Token Integration](#refresh-token-integration)
4. [File Magic Number Validation](#file-magic-number-validation)
5. [Email Verification](#email-verification)

---

## 1. WebSocket Authentication

**Priority:** CRITICAL  
**Status:** Not implemented  
**Security Risk:** Anyone can subscribe to real-time events

### Implementation Steps

#### Step 1: Update WebSocket Configuration

Edit `backend/src/config/websocket.js`:

```javascript
import { WSServerPubSub } from 'wsmini';
import { verifyToken } from './jwt.js';

export const createWebSocketServer = (server) => {
  console.log('🔌 Configuration du serveur WebSocket avec WsMini...');

  wss = new WSServerPubSub({
    httpServer: server,
    
    // Add authentication handler
    authenticate: async (request) => {
      try {
        // Extract token from query parameter or header
        const url = new URL(request.url, `http://${request.headers.host}`);
        const token = url.searchParams.get('token') || 
                     request.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          throw new Error('No token provided');
        }
        
        // Verify JWT token
        const decoded = verifyToken(token);
        
        // Return user info (will be available in connection context)
        return {
          userId: decoded.userId,
          email: decoded.email,
          role: decoded.role
        };
      } catch (error) {
        console.error('WebSocket auth failed:', error.message);
        return null; // Reject connection
      }
    },
    
    channels: {
      observations: {
        usersCanPub: false,
        // Optional: filter messages based on user permissions
        authorize: (user, channel) => {
          // Everyone can subscribe to observations
          return true;
        }
      },
      comments: {
        usersCanPub: false,
        authorize: (user, channel) => {
          return true;
        }
      },
      // Admin-only channel
      admin: {
        usersCanPub: false,
        authorize: (user, channel) => {
          return user && user.role === 'admin';
        }
      }
    }
  });

  console.log('✅ Serveur WebSocket configuré avec authentification');
  return wss;
};
```

#### Step 2: Update Frontend Connection

Edit `frontend/src/services/websocket.js`:

```javascript
import { useAuthStore } from '@/stores/auth';

export class WebSocketService {
  connect() {
    const authStore = useAuthStore();
    const token = authStore.accessToken;
    
    // Include token in connection
    const wsUrl = `${import.meta.env.VITE_WS_URL}?token=${token}`;
    this.ws = new WebSocket(wsUrl);
    
    this.ws.onopen = () => {
      console.log('WebSocket connected with authentication');
      this.subscribe('observations');
      this.subscribe('comments');
    };
    
    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      // Token might be expired, try to refresh
      this.handleAuthError();
    };
  }
  
  handleAuthError() {
    const authStore = useAuthStore();
    // Trigger token refresh
    authStore.refreshToken().then(() => {
      // Reconnect with new token
      this.connect();
    });
  }
}
```

#### Step 3: Testing

```javascript
// Test authenticated connection
const token = 'your-jwt-token';
const ws = new WebSocket(`ws://localhost:3000?token=${token}`);

ws.onopen = () => console.log('Connected!');
ws.onerror = (err) => console.error('Failed to connect:', err);

// Test without token (should fail)
const wsNoAuth = new WebSocket('ws://localhost:3000');
// Should be rejected
```

---

## 2. Account Lockout Mechanism

**Priority:** HIGH  
**Status:** Not implemented  
**Security Risk:** Vulnerable to brute force attacks

### Implementation Steps

#### Step 1: Update User Model

Edit `backend/src/models/User.js`:

```javascript
const userSchema = new mongoose.Schema({
  // ... existing fields ...
  
  // Account lockout fields
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date,
    default: null
  },
  lastFailedLogin: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Virtual for checking if account is locked
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Method to increment login attempts
userSchema.methods.incLoginAttempts = async function() {
  const maxAttempts = 5;
  const lockDuration = 15 * 60 * 1000; // 15 minutes

  // If lock has expired, reset attempts
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return await this.updateOne({
      $set: { loginAttempts: 1, lastFailedLogin: Date.now() },
      $unset: { lockUntil: 1 }
    });
  }

  // Increment attempts
  const updates = {
    $inc: { loginAttempts: 1 },
    $set: { lastFailedLogin: Date.now() }
  };

  // Lock account if max attempts reached
  if (this.loginAttempts + 1 >= maxAttempts) {
    updates.$set.lockUntil = Date.now() + lockDuration;
  }

  return await this.updateOne(updates);
};

// Method to reset login attempts after successful login
userSchema.methods.resetLoginAttempts = async function() {
  return await this.updateOne({
    $set: { loginAttempts: 0 },
    $unset: { lockUntil: 1, lastFailedLogin: 1 }
  });
};
```

#### Step 2: Update Auth Service

Edit `backend/src/services/auth.service.js`:

```javascript
async login({ email, password }) {
  const user = await User.findOne({ email }).select('+password');
  
  if (!user) {
    throw new Error('INVALID_CREDENTIALS');
  }

  // Check if account is locked
  if (user.isLocked) {
    const remainingTime = Math.ceil((user.lockUntil - Date.now()) / 1000 / 60);
    throw new Error(`ACCOUNT_LOCKED:${remainingTime}`);
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(password);
  
  if (!isPasswordValid) {
    // Increment failed attempts
    await user.incLoginAttempts();
    
    // Check if just got locked
    const updatedUser = await User.findById(user._id);
    if (updatedUser.isLocked) {
      throw new Error('ACCOUNT_LOCKED:15');
    }
    
    throw new Error('INVALID_CREDENTIALS');
  }

  // Reset attempts on successful login
  await user.resetLoginAttempts();

  // Generate tokens
  const accessToken = generateAccessToken(createTokenPayload(user));
  const refreshToken = generateRefreshToken(createTokenPayload(user));

  return {
    user: user.toSafeObject(),
    accessToken,
    refreshToken
  };
}
```

#### Step 3: Update Auth Controller

Edit `backend/src/controllers/auth.controller.js`:

```javascript
async login(req, res, next) {
  try {
    const result = await authService.login(req.body);
    
    // Log successful login
    auditLogin(req, res);
    
    return successResponse(res, result, 'Connexion réussie');
  } catch (error) {
    if (error.message === 'INVALID_CREDENTIALS') {
      // Log failed attempt
      auditFailedLogin(req.body.email, req);
      return unauthorizedResponse(res, 'Email ou mot de passe incorrect');
    }
    
    if (error.message.startsWith('ACCOUNT_LOCKED')) {
      const minutes = error.message.split(':')[1];
      return errorResponse(
        res, 
        `Compte temporairement verrouillé. Réessayez dans ${minutes} minutes.`,
        429
      );
    }
    
    next(error);
  }
}
```

#### Step 4: Testing

```bash
# Test account lockout
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrongpassword"}'
  echo "\nAttempt $i"
done

# Should see "Account locked" message after 5 attempts
```

---

## 3. Refresh Token Integration

**Priority:** HIGH  
**Status:** Model created, needs integration  

### Implementation Steps

#### Step 1: Update Auth Service

Edit `backend/src/services/auth.service.js`:

```javascript
import RefreshToken from '../models/RefreshToken.js';

async signup({ name, email, password }) {
  // ... existing code ...
  
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  
  // Store refresh token in database
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  await RefreshToken.createToken(
    newUser._id,
    refreshToken,
    expiresAt,
    {
      userAgent: req.get('user-agent'),
      ipAddress: req.ip
    }
  );
  
  return {
    user: newUser.toSafeObject(),
    accessToken,
    refreshToken
  };
}

async login({ email, password }, req) {
  // ... existing code ...
  
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  
  // Store refresh token
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await RefreshToken.createToken(
    user._id,
    refreshToken,
    expiresAt,
    {
      userAgent: req.get('user-agent'),
      ipAddress: req.ip
    }
  );
  
  return {
    user: user.toSafeObject(),
    accessToken,
    refreshToken
  };
}

async refreshToken(token, req) {
  if (!token) {
    throw new Error('REFRESH_TOKEN_REQUIRED');
  }

  // Check if token exists and is valid in database
  const isValid = await RefreshToken.isValid(token);
  if (!isValid) {
    auditInvalidRefreshToken(req);
    throw new Error('INVALID_REFRESH_TOKEN');
  }

  // Verify JWT
  const decoded = verifyToken(token, true);
  
  const user = await User.findById(decoded.userId);
  if (!user) {
    throw new Error('USER_NOT_FOUND');
  }

  // Update last used timestamp
  await RefreshToken.findOneAndUpdate(
    { token },
    { lastUsedAt: new Date() }
  );

  // Generate new access token
  const newAccessToken = generateAccessToken(createTokenPayload(user));

  return {
    accessToken: newAccessToken,
    refreshToken: token // Keep same refresh token
  };
}

async logout(token, userId) {
  // Revoke refresh token
  if (token) {
    await RefreshToken.revokeToken(token, 'User logout');
  }
}

async logoutAll(userId) {
  // Revoke all refresh tokens for user
  const revokedCount = await RefreshToken.revokeAllUserTokens(
    userId,
    'User logout from all devices'
  );
  return { revokedCount };
}
```

#### Step 2: Add Logout from All Devices Route

Edit `backend/src/routes/auth.routes.js`:

```javascript
/**
 * @route   POST /api/v1/auth/logout-all
 * @desc    Déconnexion de tous les appareils
 * @access  Private
 */
router.post(
  '/logout-all',
  authenticate,
  authController.logoutAll
);

/**
 * @route   GET /api/v1/auth/sessions
 * @desc    Récupère la liste des sessions actives
 * @access  Private
 */
router.get(
  '/sessions',
  authenticate,
  authController.getSessions
);
```

#### Step 3: Add Controller Methods

Edit `backend/src/controllers/auth.controller.js`:

```javascript
async logoutAll(req, res, next) {
  try {
    const result = await authService.logoutAll(req.user._id);
    auditLogout(req, res);
    return successResponse(res, result, 'Déconnexion de tous les appareils réussie');
  } catch (error) {
    next(error);
  }
}

async getSessions(req, res, next) {
  try {
    const sessions = await RefreshToken.getUserSessions(req.user._id);
    return successResponse(res, { sessions });
  } catch (error) {
    next(error);
  }
}
```

#### Step 4: Scheduled Cleanup

Create `backend/src/jobs/cleanupTokens.js`:

```javascript
import RefreshToken from '../models/RefreshToken.js';

/**
 * Cleanup expired refresh tokens
 * Run this job daily via cron or scheduler
 */
export const cleanupExpiredTokens = async () => {
  try {
    const deletedCount = await RefreshToken.cleanupExpired();
    console.log(`🧹 Cleaned up ${deletedCount} expired refresh tokens`);
    return deletedCount;
  } catch (error) {
    console.error('Error cleaning up tokens:', error);
    throw error;
  }
};

// Schedule with node-cron
import cron from 'node-cron';

// Run every day at 2 AM
cron.schedule('0 2 * * *', async () => {
  console.log('Running scheduled token cleanup...');
  await cleanupExpiredTokens();
});
```

---

## 4. File Magic Number Validation

**Priority:** MEDIUM  
**Status:** Not implemented  
**Security Risk:** Files with spoofed MIME types

### Implementation Steps

#### Step 1: Install file-type Package

```bash
cd backend
npm install file-type
```

#### Step 2: Create Validation Utility

Create `backend/src/utils/fileValidation.js`:

```javascript
import { fileTypeFromBuffer } from 'file-type';

/**
 * Validate file based on magic numbers (file signature)
 * @param {Buffer} buffer - File buffer
 * @param {Array<string>} allowedTypes - Allowed MIME types
 * @returns {Promise<boolean>}
 */
export const validateFileType = async (buffer, allowedTypes) => {
  try {
    const type = await fileTypeFromBuffer(buffer);
    
    if (!type) {
      console.warn('Could not determine file type from buffer');
      return false;
    }
    
    return allowedTypes.includes(type.mime);
  } catch (error) {
    console.error('Error validating file type:', error);
    return false;
  }
};

/**
 * Validate image file
 * @param {Buffer} buffer - Image buffer
 * @returns {Promise<boolean>}
 */
export const validateImageFile = async (buffer) => {
  const allowedImageTypes = [
    'image/jpeg',
    'image/png',
    'image/webp'
  ];
  
  return await validateFileType(buffer, allowedImageTypes);
};

export default {
  validateFileType,
  validateImageFile
};
```

#### Step 3: Update Image Controller

Edit `backend/src/controllers/image.controller.js`:

```javascript
import { validateImageFile } from '../utils/fileValidation.js';

async uploadImage(req, res, next) {
  try {
    if (!req.file) {
      return errorResponse(res, 'Aucun fichier fourni', 400);
    }

    // Validate MIME type (first layer)
    if (!isImageTypeAllowed(req.file.mimetype)) {
      return errorResponse(res, 'Type de fichier non autorisé', 400);
    }

    // Validate file content using magic numbers (second layer)
    const isValidImage = await validateImageFile(req.file.buffer);
    if (!isValidImage) {
      return errorResponse(
        res,
        'Le contenu du fichier ne correspond pas à un format d\'image valide',
        400
      );
    }

    // Proceed with compression and storage
    const imageUrl = await imageService.uploadImage(
      req.file.buffer,
      req.params.id
    );

    return successResponse(res, { imageUrl }, 'Image téléchargée avec succès');
  } catch (error) {
    next(error);
  }
}
```

#### Step 4: Testing

```javascript
// Test with valid image
const validImageBuffer = fs.readFileSync('test-image.jpg');
const isValid = await validateImageFile(validImageBuffer);
console.log('Valid image:', isValid); // Should be true

// Test with spoofed file (text file with .jpg extension)
const spoofedBuffer = Buffer.from('This is not an image');
const isValidSpoofed = await validateImageFile(spoofedBuffer);
console.log('Spoofed file:', isValidSpoofed); // Should be false
```

---

## 5. Email Verification

**Priority:** MEDIUM  
**Status:** Not implemented  
**Security Risk:** Spam accounts, invalid emails

### Implementation Steps

#### Step 1: Update User Model

Edit `backend/src/models/User.js`:

```javascript
const userSchema = new mongoose.Schema({
  // ... existing fields ...
  
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    default: null
  },
  emailVerificationExpires: {
    type: Date,
    default: null
  }
});

// Method to generate email verification token
userSchema.methods.generateEmailVerificationToken = function() {
  const crypto = require('crypto');
  const token = crypto.randomBytes(32).toString('hex');
  
  this.emailVerificationToken = token;
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  
  return token;
};
```

#### Step 2: Create Email Service

Create `backend/src/services/email.service.js`:

```javascript
import nodemailer from 'nodemailer';

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async sendVerificationEmail(email, token) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    
    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Vérifiez votre adresse email - Phenom',
      html: `
        <h1>Bienvenue sur Phenom!</h1>
        <p>Veuillez cliquer sur le lien ci-dessous pour vérifier votre adresse email:</p>
        <a href="${verificationUrl}">${verificationUrl}</a>
        <p>Ce lien expirera dans 24 heures.</p>
      `
    };

    return await this.transporter.sendMail(mailOptions);
  }
}

export default new EmailService();
```

#### Step 3: Update Auth Service

Edit `backend/src/services/auth.service.js`:

```javascript
import emailService from './email.service.js';

async signup({ name, email, password }) {
  // Check if email exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('EMAIL_ALREADY_EXISTS');
  }

  // Create user
  const newUser = await User.create({
    name,
    email,
    password
  });

  // Generate verification token
  const verificationToken = newUser.generateEmailVerificationToken();
  await newUser.save();

  // Send verification email
  await emailService.sendVerificationEmail(email, verificationToken);

  // Generate tokens (but user should verify email before full access)
  const payload = createTokenPayload(newUser);
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  return {
    user: newUser.toSafeObject(),
    accessToken,
    refreshToken,
    message: 'Un email de vérification a été envoyé à votre adresse'
  };
}

async verifyEmail(token) {
  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationExpires: { $gt: Date.now() }
  });

  if (!user) {
    throw new Error('INVALID_OR_EXPIRED_TOKEN');
  }

  user.emailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  return { message: 'Email vérifié avec succès' };
}
```

#### Step 4: Add Verification Route

Edit `backend/src/routes/auth.routes.js`:

```javascript
/**
 * @route   POST /api/v1/auth/verify-email
 * @desc    Vérifie l'adresse email
 * @access  Public
 */
router.post(
  '/verify-email',
  body('token').notEmpty().withMessage('Token requis'),
  validate,
  authController.verifyEmail
);

/**
 * @route   POST /api/v1/auth/resend-verification
 * @desc    Renvoie l'email de vérification
 * @access  Private
 */
router.post(
  '/resend-verification',
  authenticate,
  authController.resendVerification
);
```

#### Step 5: Protect Routes

Create middleware `backend/src/middleware/requireEmailVerification.js`:

```javascript
export const requireEmailVerification = (req, res, next) => {
  if (!req.user.emailVerified) {
    return res.status(403).json({
      success: false,
      error: 'Email non vérifié. Veuillez vérifier votre email avant de continuer.'
    });
  }
  next();
};
```

Apply to protected routes:
```javascript
router.post(
  '/observations',
  authenticate,
  requireEmailVerification, // Add this
  createObservationValidation,
  validate,
  observationController.createObservation
);
```

---

## Implementation Timeline

### Week 1 (Immediate)
1. ✅ Refresh Token Integration
2. ✅ Account Lockout Mechanism

### Week 2 (High Priority)
3. ✅ WebSocket Authentication
4. ✅ File Magic Number Validation

### Week 3 (Medium Priority)
5. ✅ Email Verification

### Week 4 (Testing & Documentation)
6. ✅ Integration testing
7. ✅ Security testing
8. ✅ Documentation updates

---

## Testing Checklist

After each implementation:

- [ ] Unit tests added
- [ ] Integration tests added
- [ ] Manual testing completed
- [ ] Security testing (attempt to bypass)
- [ ] Documentation updated
- [ ] Code review completed
- [ ] Deployed to staging
- [ ] Verified in production-like environment

---

## Rollback Plan

If any feature causes issues:

1. Revert the commit: `git revert <commit-hash>`
2. Push the revert: `git push origin main`
3. Monitor logs for any related errors
4. Fix the issue in a separate branch
5. Test thoroughly before re-deploying

---

**Last Updated:** 2025-11-11  
**Owner:** Development Team  
**Review:** Security Team
