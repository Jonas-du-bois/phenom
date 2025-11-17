# Database Schema

Phenom uses MongoDB, a NoSQL document database, with Mongoose as the ODM (Object Document Mapper). The database is hosted on MongoDB Atlas.

## Database Overview

- **Database Name**: `phenom_dev` (development), `phenom_test` (testing), `phenom` (production)
- **Engine**: MongoDB 7.0+
- **Hosting**: MongoDB Atlas (Cloud)
- **ODM**: Mongoose 8.0
- **Connection**: Via connection string (MongoDB Atlas)

## Collections

The database has 3 main collections:

1. **users** - User accounts and profiles
2. **observations** - UFO observation reports
3. **comments** - Comments on observations

## Collection Schemas

### 1. Users Collection

Stores user account information and profiles.

#### Schema Definition

```javascript
{
  _id: ObjectId,                    // Auto-generated MongoDB ID
  name: String,                     // User's display name
  email: String,                    // Unique email address
  password: String,                 // Hashed password (bcrypt)
  role: String,                     // 'admin' or 'viewer'
  bio: String,                      // User bio/description
  createdAt: Date,                  // Account creation timestamp
  updatedAt: Date                   // Last update timestamp
}
```

#### Field Details

| Field | Type | Required | Constraints | Default |
|-------|------|----------|-------------|---------|
| `name` | String | Yes | 2-50 chars, trimmed | - |
| `email` | String | Yes | Valid email, unique, lowercase | - |
| `password` | String | Yes | Min 6 chars, hashed | - |
| `role` | String (Enum) | No | 'admin' or 'viewer' | 'viewer' |
| `bio` | String | No | Max 500 chars | '' |
| `createdAt` | Date | Auto | - | Date.now() |
| `updatedAt` | Date | Auto | - | Date.now() |

#### Indexes

```javascript
// Unique index on email
{ email: 1 }  (unique)

// Index on creation date for sorting
{ createdAt: -1 }
```

#### Validation Rules

- **name**: 
  - Required
  - Minimum 2 characters
  - Maximum 50 characters
  - Trimmed

- **email**: 
  - Required
  - Must be valid email format (`/^\S+@\S+\.\S+$/`)
  - Unique across all users
  - Converted to lowercase
  - Trimmed

- **password**:
  - Required
  - Minimum 6 characters
  - Automatically hashed with bcrypt (10 rounds) before saving
  - Never returned in API responses (`select: false`)

- **role**:
  - Must be either 'admin' or 'viewer'
  - Defaults to 'viewer'

- **bio**:
  - Optional
  - Maximum 500 characters
  - Trimmed

#### Methods

**comparePassword(candidatePassword)**
- Compares a plain text password with the hashed password
- Returns: `Promise<boolean>`

**toSafeObject()**
- Returns user object without the password field
- Returns: `Object`

#### Pre-save Hook

```javascript
// Hash password before saving if modified
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})
```

#### Example Document

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy",
  "role": "viewer",
  "bio": "UFO enthusiast and skywatcher from California",
  "createdAt": "2024-11-15T10:30:00.000Z",
  "updatedAt": "2024-11-15T10:30:00.000Z"
}
```

### 2. Observations Collection

Stores UFO observation reports with geolocation and images.

#### Schema Definition

```javascript
{
  _id: ObjectId,                    // Auto-generated MongoDB ID
  title: String,                    // Observation title
  description: String,              // Detailed description
  images: [{                        // Array of image objects
    publicId: String,               // Cloudinary public ID
    url: String,                    // Cloudinary HTTPS URL
    size: Number,                   // File size in bytes
    format: String,                 // Image format (jpeg, png, webp)
    width: Number,                  // Image width in pixels
    height: Number,                 // Image height in pixels
    uploadedAt: Date                // Upload timestamp
  }],
  location: {                       // GeoJSON Point
    type: String,                   // Always 'Point'
    coordinates: [Number, Number]   // [longitude, latitude]
  },
  userId: ObjectId,                 // Reference to Users collection
  date: Date,                       // Observation date/time
  type: String,                     // Phenomenon classification code
  tags: [String],                   // Array of tags
  createdAt: Date,                  // Creation timestamp
  updatedAt: Date                   // Last update timestamp
}
```

#### Field Details

| Field | Type | Required | Constraints | Default |
|-------|------|----------|-------------|---------|
| `title` | String | Yes | 3-100 chars | - |
| `description` | String | Yes | 10-2000 chars | - |
| `images` | Array | No | Array of image objects | [] |
| `location.type` | String | Yes | Must be 'Point' | 'Point' |
| `location.coordinates` | Array[Number] | Yes | [lng, lat], valid coords | - |
| `userId` | ObjectId | Yes | Valid User ID | - |
| `date` | Date | No | - | Date.now() |
| `type` | String (Enum) | No | One of 27 codes | - |
| `tags` | Array[String] | No | Each 2-30 chars | [] |

#### Indexes

```javascript
// Geospatial index for location-based queries
{ location: '2dsphere' }

// Compound index for user's observations sorted by date
{ userId: 1, createdAt: -1 }

// Index on creation date for sorting
{ createdAt: -1 }

// Index on observation type
{ type: 1 }

// Index on tags for filtering
{ tags: 1 }

// Text search index
{
  title: 'text',
  description: 'text',
  tags: 'text'
}
// Weights: title=10, tags=8, description=5
```

#### Validation Rules

- **title**:
  - Required
  - 3-100 characters
  - Trimmed

- **description**:
  - Required
  - 10-2000 characters
  - Trimmed

- **images**:
  - Each image object must have: publicId, url, size, format
  - Optional width and height
  - uploadedAt defaults to current date

- **location.coordinates**:
  - Required
  - Must be array of exactly 2 numbers
  - longitude: -180 to 180
  - latitude: -90 to 90
  - Format: [longitude, latitude] (GeoJSON standard)

- **type**:
  - Optional
  - Must be one of 27 predefined codes (see [Observation Types](Observation-Types))
  - Codes: WAV, TCH, HST, SND, ODD, LND, SUB, OBS, RAY, SIG, ANI, HUM, INJ, VEH, BLD, DRT, VEG, PHT, RDA, TRC, NOC, CMF, MID, CNT, OID, COV, OGA

- **tags**:
  - Each tag: 2-30 characters
  - Array of strings
  - Trimmed

#### Virtual Fields

```javascript
// Virtual for comment count
commentsCount: {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'observationId',
  count: true
}

// Virtual for comments array
comments: {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'observationId'
}
```

**Note**: Virtual fields are not stored in the database but can be populated on queries.

#### Example Document

```json
{
  "_id": "507f1f77bcf86cd799439012",
  "title": "Triangular UFO over Geneva",
  "description": "Witnessed a large triangular craft with bright lights at each corner. Silent movement, estimated altitude 500m. Duration approximately 5 minutes before disappearing behind clouds.",
  "images": [
    {
      "publicId": "phenom/observations/abc123def456",
      "url": "https://res.cloudinary.com/phenom/image/upload/v1234567890/phenom/observations/abc123def456.jpg",
      "size": 2457600,
      "format": "jpg",
      "width": 1920,
      "height": 1080,
      "uploadedAt": "2024-11-15T20:45:00.000Z"
    }
  ],
  "location": {
    "type": "Point",
    "coordinates": [6.1432, 46.2044]  // [longitude, latitude]
  },
  "userId": "507f1f77bcf86cd799439011",
  "date": "2024-11-15T20:30:00.000Z",
  "type": "RAY",
  "tags": ["night", "triangular", "silent", "lights"],
  "createdAt": "2024-11-15T21:00:00.000Z",
  "updatedAt": "2024-11-15T21:00:00.000Z"
}
```

### 3. Comments Collection

Stores user comments on observations.

#### Schema Definition

```javascript
{
  _id: ObjectId,                    // Auto-generated MongoDB ID
  text: String,                     // Comment text
  observationId: ObjectId,          // Reference to Observations collection
  userId: ObjectId,                 // Reference to Users collection
  createdAt: Date,                  // Creation timestamp
  updatedAt: Date                   // Last update timestamp
}
```

#### Field Details

| Field | Type | Required | Constraints | Default |
|-------|------|----------|-------------|---------|
| `text` | String | Yes | 1-500 chars | - |
| `observationId` | ObjectId | Yes | Valid Observation ID | - |
| `userId` | ObjectId | Yes | Valid User ID | - |
| `createdAt` | Date | Auto | - | Date.now() |
| `updatedAt` | Date | Auto | - | Date.now() |

#### Indexes

```javascript
// Compound index for observation's comments sorted by date
{ observationId: 1, createdAt: -1 }

// Index on user for finding user's comments
{ userId: 1 }

// Index on creation date
{ createdAt: -1 }
```

#### Validation Rules

- **text**:
  - Required
  - 1-500 characters
  - Trimmed

- **observationId**:
  - Required
  - Must be valid ObjectId
  - Must reference existing observation

- **userId**:
  - Required
  - Must be valid ObjectId
  - Must reference existing user

#### Example Document

```json
{
  "_id": "507f1f77bcf86cd799439013",
  "text": "I saw something similar in the same area last week! Same triangular shape and silent movement.",
  "observationId": "507f1f77bcf86cd799439012",
  "userId": "507f1f77bcf86cd799439011",
  "createdAt": "2024-11-16T08:30:00.000Z",
  "updatedAt": "2024-11-16T08:30:00.000Z"
}
```

## Relationships

### User → Observations (One-to-Many)

A user can create multiple observations.

```javascript
// In Observation model
userId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User',
  required: true
}

// Query with population
const observation = await Observation
  .findById(id)
  .populate('userId', 'name email role')
```

### User → Comments (One-to-Many)

A user can post multiple comments.

```javascript
// In Comment model
userId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User',
  required: true
}

// Query with population
const comment = await Comment
  .findById(id)
  .populate('userId', 'name email')
```

### Observation → Comments (One-to-Many)

An observation can have multiple comments.

```javascript
// In Comment model
observationId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Observation',
  required: true
}

// Virtual in Observation model
observationSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'observationId'
})

// Query with virtual population
const observation = await Observation
  .findById(id)
  .populate('comments')
  .populate('userId', 'name email')
```

## Entity Relationship Diagram

```
┌─────────────────┐
│     Users       │
├─────────────────┤
│ _id (PK)        │
│ name            │
│ email (unique)  │
│ password        │
│ role            │
│ bio             │
│ createdAt       │
│ updatedAt       │
└────────┬────────┘
         │
         │ 1:N
         │
         ▼
┌─────────────────┐
│  Observations   │
├─────────────────┤
│ _id (PK)        │
│ title           │
│ description     │
│ images[]        │
│ location        │
│ userId (FK)     │◄───┐
│ date            │    │
│ type            │    │ 1:N
│ tags[]          │    │
│ createdAt       │    │
│ updatedAt       │    │
└────────┬────────┘    │
         │             │
         │ 1:N         │
         │             │
         ▼             │
┌─────────────────┐    │
│    Comments     │    │
├─────────────────┤    │
│ _id (PK)        │    │
│ text            │    │
│ observationId(FK)────┘
│ userId (FK)     │────────────┐
│ createdAt       │            │
│ updatedAt       │            │
└─────────────────┘            │
                               │
                               │ N:1
                               │
                  ┌────────────┘
                  │
                  ▼
         (Referenced User)
```

## Common Queries

### Find User's Observations

```javascript
const observations = await Observation
  .find({ userId: userId })
  .sort({ createdAt: -1 })
  .limit(20)
```

### Find Observations Near Location (Geospatial)

```javascript
const observations = await Observation.find({
  location: {
    $near: {
      $geometry: {
        type: 'Point',
        coordinates: [longitude, latitude]
      },
      $maxDistance: 50000  // 50km in meters
    }
  }
})
```

### Find Observations with Comments Count

```javascript
const observations = await Observation
  .find()
  .populate('commentsCount')
  .populate('userId', 'name email')
  .sort({ createdAt: -1 })
```

### Full Text Search

```javascript
const observations = await Observation
  .find({ $text: { $search: searchQuery } })
  .select({ score: { $meta: 'textScore' } })
  .sort({ score: { $meta: 'textScore' } })
```

### Find Observation with Comments and User Info

```javascript
const observation = await Observation
  .findById(id)
  .populate('userId', 'name email role bio')
  .populate({
    path: 'comments',
    populate: {
      path: 'userId',
      select: 'name email'
    },
    options: { sort: { createdAt: -1 } }
  })
```

## Aggregation Examples

### Observations by Type Count

```javascript
const stats = await Observation.aggregate([
  { $group: {
    _id: '$type',
    count: { $sum: 1 }
  }},
  { $sort: { count: -1 } }
])
```

### User Statistics

```javascript
const userStats = await User.aggregate([
  {
    $lookup: {
      from: 'observations',
      localField: '_id',
      foreignField: 'userId',
      as: 'observations'
    }
  },
  {
    $project: {
      name: 1,
      email: 1,
      observationCount: { $size: '$observations' },
      createdAt: 1
    }
  }
])
```

### Monthly Observation Trends

```javascript
const trends = await Observation.aggregate([
  {
    $group: {
      _id: {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' }
      },
      count: { $sum: 1 }
    }
  },
  { $sort: { '_id.year': -1, '_id.month': -1 } }
])
```

## Data Integrity

### Cascade Deletions

When a user is deleted, their associated data should be handled:

```javascript
// Delete user's observations
await Observation.deleteMany({ userId: userId })

// Delete user's comments
await Comment.deleteMany({ userId: userId })

// Delete user
await User.findByIdAndDelete(userId)
```

When an observation is deleted:

```javascript
// Delete observation's comments
await Comment.deleteMany({ observationId: observationId })

// Delete observation's images from Cloudinary
for (const image of observation.images) {
  await deleteImage(image.publicId)
}

// Delete observation
await Observation.findByIdAndDelete(observationId)
```

## Database Migrations

Phenom uses schema validation and indexes defined in Mongoose models. Changes to the schema should be managed carefully.

### Adding a New Field

```javascript
// 1. Update the model
// 2. Deploy with mongoose.set('autoIndex', true) in dev
// 3. Indexes will be created automatically
// 4. In production, create indexes manually or use migrations
```

### Creating Indexes Manually

```javascript
// Connect to MongoDB
await connectDB()

// Create index
await Observation.collection.createIndex({ newField: 1 })

// Verify
const indexes = await Observation.collection.indexes()
console.log(indexes)
```

## Performance Considerations

### Indexing Strategy

- All foreign keys are indexed
- Geospatial queries use 2dsphere index
- Text search uses text index with weighted fields
- Compound indexes for common queries (userId + createdAt)

### Query Optimization

- Use `.select()` to limit returned fields
- Use `.lean()` for read-only queries (faster)
- Populate only necessary fields
- Implement pagination to limit results
- Cache frequently accessed data

### Connection Pooling

```javascript
// Configured in database.js
{
  maxPoolSize: 10,
  minPoolSize: 5,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 10000
}
```

## Security

### Data Protection

- Passwords are hashed with bcrypt (10 rounds)
- Password field is never selected by default (`select: false`)
- Input validation on all fields
- Mongoose schema validation prevents invalid data
- MongoDB connection uses authentication

### Injection Prevention

- Mongoose automatically escapes special characters
- All ObjectIds are validated
- Input sanitization via express-validator
- No direct string concatenation in queries

## Backup & Recovery

### MongoDB Atlas Backups

- Automatic daily backups (Atlas M0 Free tier: limited)
- Point-in-time recovery (paid tiers)
- Manual export/import using `mongodump`/`mongorestore`

### Manual Backup

```bash
# Export database
mongodump --uri="mongodb+srv://..." --out=./backup

# Import database
mongorestore --uri="mongodb+srv://..." ./backup
```

## Related Documentation

- [Backend Architecture](Backend-Architecture) - Backend implementation
- [API Reference](API-Reference) - API endpoints
- [Observation Types](Observation-Types) - UFO classification codes
- [Environment Variables](Environment-Variables) - Configuration
