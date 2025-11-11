# Security Best Practices - Phenom Backend

This document outlines security best practices and guidelines for maintaining the security of the Phenom backend API.

## Table of Contents

1. [Authentication & Authorization](#authentication--authorization)
2. [Input Validation](#input-validation)
3. [Password Management](#password-management)
4. [Session Management](#session-management)
5. [API Security](#api-security)
6. [Database Security](#database-security)
7. [File Upload Security](#file-upload-security)
8. [Error Handling](#error-handling)
9. [Logging & Monitoring](#logging--monitoring)
10. [Deployment Security](#deployment-security)

---

## Authentication & Authorization

### JWT Token Management

**DO:**
- ✅ Use separate access and refresh tokens
- ✅ Keep access tokens short-lived (1 hour or less)
- ✅ Store refresh tokens securely (httpOnly cookies preferred)
- ✅ Validate tokens on every protected route
- ✅ Use strong, randomly generated secrets (64+ characters)
- ✅ Implement token revocation mechanism

**DON'T:**
- ❌ Store tokens in localStorage (vulnerable to XSS)
- ❌ Use the same secret for access and refresh tokens
- ❌ Set excessively long expiration times
- ❌ Include sensitive data in JWT payload
- ❌ Trust token payload without verification

### Password Requirements

**Current Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one digit

**Recommendations:**
```javascript
// Strong password example
const strongPassword = "MySecureP@ss123";

// Weak passwords to reject
const weakPasswords = [
  "password123",  // Too common
  "12345678",     // Sequential
  "qwerty123",    // Keyboard pattern
];
```

### Role-Based Access Control (RBAC)

**Roles:**
- `viewer` - Regular users (read/create own content)
- `admin` - Administrators (full access)

**Always check:**
1. User is authenticated (`authenticate` middleware)
2. User has required role (`authorize` middleware)
3. User owns resource or is admin (`isOwnerOrAdmin` middleware)

---

## Input Validation

### Validation Rules

**ALWAYS validate:**
- ✅ All user inputs (body, query, params)
- ✅ Data types (string, number, boolean)
- ✅ Length constraints (min/max)
- ✅ Format (email, URL, MongoDB ObjectId)
- ✅ Value ranges (coordinates, dates)

**Example:**
```javascript
// Good
body('email')
  .trim()
  .notEmpty()
  .isEmail()
  .normalizeEmail();

// Bad - Missing validation
body('email'); // No checks!
```

### XSS Prevention

**Protection mechanisms:**
1. HTML escaping with `.escape()` in validators
2. Content Security Policy (CSP) headers
3. Output encoding when rendering
4. Avoid `innerHTML` in frontend

**Example:**
```javascript
// Sanitize user input
body('title')
  .trim()
  .escape() // Converts <script> to &lt;script&gt;
  .isLength({ min: 3, max: 100 });
```

### NoSQL Injection Prevention

**Mongoose protection:**
- ✅ Automatic type casting
- ✅ Schema validation
- ✅ Input sanitization via express-validator

**Example:**
```javascript
// Safe - Mongoose validates types
const user = await User.findById(userId);

// Unsafe - Using raw queries
// DON'T DO THIS:
const user = await db.collection('users')
  .find({ _id: req.body.userId }); // Vulnerable!
```

---

## Password Management

### Hashing

**Current implementation:**
- Algorithm: bcrypt
- Rounds: 10 (2^10 = 1024 iterations)
- Automatic salting

**Best practices:**
```javascript
// Good - Let bcrypt generate salt automatically
const salt = await bcrypt.genSalt(10);
const hash = await bcrypt.hash(password, salt);

// Alternative - Direct hashing (same result)
const hash = await bcrypt.hash(password, 10);
```

### Password Reset Flow

**Secure implementation:**
1. User requests reset (email only, don't confirm if exists)
2. Generate secure random token
3. Store token with expiration (15-60 minutes)
4. Send token via email
5. Validate token before allowing reset
6. Invalidate token after use

**Security considerations:**
- ❌ Don't reveal if email exists
- ❌ Don't include user info in token
- ✅ Use time-limited tokens
- ✅ Invalidate after single use
- ✅ Rate limit reset requests

---

## Session Management

### Refresh Token Best Practices

**Implementation:**
```javascript
// Store refresh tokens in database
await RefreshToken.createToken(
  userId,
  refreshToken,
  expiresAt,
  { userAgent: req.get('user-agent'), ipAddress: req.ip }
);

// Verify before use
const isValid = await RefreshToken.isValid(token);
if (!isValid) {
  throw new Error('INVALID_REFRESH_TOKEN');
}
```

**Session tracking features:**
- Track active sessions per user
- Show device/IP information
- Allow users to revoke specific sessions
- Implement "logout from all devices"

### Account Lockout

**Recommended implementation:**
```javascript
// After 5 failed login attempts
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

if (user.loginAttempts >= MAX_ATTEMPTS) {
  const timeSinceLock = Date.now() - user.lastFailedLogin;
  if (timeSinceLock < LOCKOUT_DURATION) {
    throw new Error('ACCOUNT_LOCKED');
  }
}
```

---

## API Security

### Rate Limiting

**Current limits:**
```javascript
// General API: 100 requests / 15 minutes
// Authentication: 5 attempts / 15 minutes
// Content creation: 20 items / hour
```

**Adjust for production:**
```bash
# .env configuration
RATE_LIMIT_WINDOW_MS=900000      # 15 minutes
RATE_LIMIT_MAX_REQUESTS=50       # Stricter in production
```

**Distributed rate limiting:**
For multiple server instances, use Redis:
```javascript
import RedisStore from 'rate-limit-redis';
import { createClient } from 'redis';

const client = createClient({ url: process.env.REDIS_URL });
await client.connect();

export const generalLimiter = rateLimit({
  store: new RedisStore({ client }),
  windowMs: 15 * 60 * 1000,
  max: 100
});
```

### CORS Configuration

**Current setup:**
```javascript
cors({
  origin: process.env.CORS_ORIGIN?.split(',') || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
});
```

**Production checklist:**
- ✅ Set specific origins (no wildcards)
- ✅ Enable credentials if using cookies
- ✅ Limit HTTP methods to what's needed
- ✅ Validate origin format at startup

**Example:**
```bash
# Production .env
CORS_ORIGIN=https://phenom-app.com,https://www.phenom-app.com
```

### Security Headers

**Implemented via Helmet:**
- `Content-Security-Policy` - XSS protection
- `X-Content-Type-Options: nosniff` - MIME sniffing protection
- `X-Frame-Options: DENY` - Clickjacking protection
- `Strict-Transport-Security` - Force HTTPS
- `X-XSS-Protection` - Legacy XSS filter
- `Referrer-Policy` - Control referrer information

---

## Database Security

### MongoDB Connection Security

**Best practices:**
```bash
# Use MongoDB Atlas with:
# 1. Strong password (32+ characters)
# 2. IP whitelist (specific IPs, not 0.0.0.0/0)
# 3. Database user with minimal permissions
# 4. TLS/SSL encryption enabled

MONGODB_URI=mongodb+srv://username:strongpassword@cluster.mongodb.net/dbname?retryWrites=true&w=majority&ssl=true
```

**Connection options:**
```javascript
const options = {
  maxPoolSize: 10,        // Limit connections
  minPoolSize: 5,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 10000,
};
```

### Query Security

**Timeout protection:**
```javascript
// Prevent long-running queries (DoS protection)
mongoose.set('maxTimeMS', 10000); // 10 seconds max
```

**Index optimization:**
```javascript
// Disable auto-indexing in production
mongoose.set('autoIndex', process.env.NODE_ENV !== 'production');

// Create indexes manually in production
await User.collection.createIndex({ email: 1 }, { unique: true });
```

### Data Sanitization

**Before saving:**
```javascript
// Trim whitespace
user.email = user.email.trim().toLowerCase();

// Remove undefined fields
Object.keys(updateData).forEach(
  key => updateData[key] === undefined && delete updateData[key]
);
```

---

## File Upload Security

### Validation Layers

**1. MIME Type Check:**
```javascript
const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
if (!allowedTypes.includes(file.mimetype)) {
  throw new Error('File type not allowed');
}
```

**2. File Size Limit:**
```javascript
const MAX_SIZE = 10 * 1024 * 1024; // 10MB
if (file.size > MAX_SIZE) {
  throw new Error('File too large');
}
```

**3. Magic Number Validation (Recommended):**
```javascript
import fileType from 'file-type';

const type = await fileType.fromBuffer(file.buffer);
if (!type || !allowedTypes.includes(type.mime)) {
  throw new Error('Invalid file content');
}
```

### Safe Storage

**Current implementation:**
- ✅ Memory storage (no temp files)
- ✅ Image processing with Sharp
- ✅ GridFS for final storage
- ✅ Isolated from application code

**Recommendations:**
- ✅ Compress images before storage
- ✅ Generate unique filenames
- ✅ Scan for malware (if handling non-image files)
- ✅ Implement virus scanning (ClamAV)

---

## Error Handling

### Error Messages

**DO:**
```javascript
// Generic error messages for users
return res.status(401).json({
  success: false,
  error: 'Authentication failed'
});
```

**DON'T:**
```javascript
// Revealing internal details
return res.status(401).json({
  error: 'User not found in users table', // ❌ Database structure leaked
  details: err.stack                       // ❌ Stack trace exposed
});
```

### Information Disclosure Prevention

**Current fixes:**
```javascript
// Before: Exposed field name
if (err.code === 11000) {
  const field = Object.keys(err.keyPattern)[0];
  error.message = `${field} existe déjà`; // ❌ Bad
}

// After: Generic message
if (err.code === 11000) {
  error.message = 'Cette ressource existe déjà'; // ✅ Good
}
```

### Logging Best Practices

**What to log:**
- ✅ Authentication attempts (success/failure)
- ✅ Authorization failures
- ✅ Admin actions
- ✅ Data modifications
- ✅ System errors

**What NOT to log:**
- ❌ Passwords (hashed or plain)
- ❌ JWT tokens
- ❌ API keys
- ❌ Credit card numbers
- ❌ Personal identification numbers

**Example:**
```javascript
// Good
console.log('[AUTH] Login attempt for user:', email);
console.log('[AUDIT] Admin deleted observation:', observationId);

// Bad
console.log('[AUTH] Login with password:', password); // ❌ Never log passwords!
console.log('[AUTH] Token:', jwtToken); // ❌ Never log tokens!
```

---

## Logging & Monitoring

### Audit Logging

**Implementation:**
```javascript
import { logAuditEvent } from './middleware/auditLog.js';

// Log security events
logAuditEvent('LOGIN_SUCCESS', { email: user.email }, req);
logAuditEvent('ROLE_CHANGE', { targetUser, newRole }, req);
logAuditEvent('ADMIN_DELETE', { resourceType, resourceId }, req);
```

**Events to track:**
1. Authentication events (login, logout, failed attempts)
2. Authorization failures
3. Admin actions (role changes, deletions)
4. Data modifications (create, update, delete)
5. Configuration changes
6. Security events (suspicious activity)

### Production Logging

**Recommended setup:**
```javascript
// Use Winston or Pino for production logging
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// Send logs to external service
// - Datadog
// - LogDNA
// - CloudWatch
// - Elasticsearch
```

### Security Monitoring

**Alerts to configure:**
- 🚨 Multiple failed login attempts
- 🚨 Unusual number of requests from single IP
- 🚨 Admin role changes
- 🚨 Large data exports
- 🚨 Database errors
- 🚨 Application crashes

---

## Deployment Security

### Environment Variables

**Required variables checklist:**
```bash
# Required
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=<64+ characters>
JWT_REFRESH_SECRET=<64+ characters>
CORS_ORIGIN=https://yourdomain.com

# Optional but recommended
JWT_EXPIRE=1h
JWT_REFRESH_EXPIRE=7d
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=50
MAX_FILE_SIZE=10485760
```

**Validation:**
```javascript
// Validate at startup
import { cleanEnv, str, port, url } from 'envalid';

const env = cleanEnv(process.env, {
  NODE_ENV: str({ choices: ['development', 'production', 'test'] }),
  PORT: port({ default: 3000 }),
  MONGODB_URI: url(),
  JWT_SECRET: str({ minLength: 32 }),
  JWT_REFRESH_SECRET: str({ minLength: 32 }),
  CORS_ORIGIN: str(),
});
```

### HTTPS Configuration

**Required for production:**
```javascript
// Enable HSTS
app.use(helmet.hsts({
  maxAge: 31536000,    // 1 year
  includeSubDomains: true,
  preload: true
}));

// Redirect HTTP to HTTPS (if not handled by reverse proxy)
app.use((req, res, next) => {
  if (req.header('x-forwarded-proto') !== 'https') {
    res.redirect(`https://${req.header('host')}${req.url}`);
  } else {
    next();
  }
});
```

### Reverse Proxy Configuration

**Trust proxy settings:**
```javascript
// app.js
app.set('trust proxy', 1); // Trust first proxy

// For specific proxies (more secure)
app.set('trust proxy', 'loopback, 10.0.0.0/8');
```

**Nginx configuration example:**
```nginx
server {
    listen 443 ssl http2;
    server_name api.phenom.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Backup & Disaster Recovery

**MongoDB backup:**
```bash
# Automated backup script
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mongodump --uri="$MONGODB_URI" --out="backup_$TIMESTAMP"
tar -czf "backup_$TIMESTAMP.tar.gz" "backup_$TIMESTAMP"
# Upload to S3 or backup service
aws s3 cp "backup_$TIMESTAMP.tar.gz" s3://phenom-backups/
```

**Recovery plan:**
1. Database backups (automated daily)
2. Application code in version control
3. Environment variables documented
4. Infrastructure as code (Docker, Kubernetes)
5. Disaster recovery procedures documented

---

## Security Checklist

### Pre-Deployment

- [ ] All dependencies updated (no critical vulnerabilities)
- [ ] Environment variables validated
- [ ] JWT secrets strong (64+ characters)
- [ ] CORS configured with specific origins
- [ ] HTTPS enforced
- [ ] Rate limiting configured appropriately
- [ ] Password requirements enforced (8+ chars, complexity)
- [ ] Error messages don't leak information
- [ ] Audit logging enabled
- [ ] Database connection secured (Atlas with IP whitelist)
- [ ] File upload validation comprehensive
- [ ] Security headers configured (Helmet)
- [ ] Trust proxy configured
- [ ] Session management implemented (refresh tokens tracked)
- [ ] WebSocket authentication implemented
- [ ] Backup strategy in place

### Regular Maintenance

- [ ] Weekly dependency updates
- [ ] Monthly security audits
- [ ] Quarterly penetration testing
- [ ] Review audit logs regularly
- [ ] Monitor for security advisories
- [ ] Update secrets periodically
- [ ] Review and rotate API keys
- [ ] Check for unused dependencies
- [ ] Review user permissions
- [ ] Test backup restoration

### Incident Response

**If security breach detected:**
1. Identify affected systems
2. Contain the breach (isolate affected systems)
3. Notify affected users
4. Investigate root cause
5. Implement fixes
6. Document lessons learned
7. Review and update security measures

---

## Resources

### Tools

- **OWASP ZAP** - Automated security testing
- **Snyk** - Dependency vulnerability scanning
- **CodeQL** - Static code analysis
- **npm audit** - Check for vulnerable packages
- **ESLint** - Code quality and security rules

### Documentation

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Checklist](https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [MongoDB Security Checklist](https://docs.mongodb.com/manual/administration/security-checklist/)

---

**Last Updated:** 2025-11-11  
**Review Frequency:** Monthly  
**Owner:** Security Team
