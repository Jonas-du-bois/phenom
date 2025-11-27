# Database Schema

Phenom uses **MongoDB**, a NoSQL document database. We use **Mongoose** for object modeling.

## User

Collection: `users`

| Field | Type | Description | Constraints |
|:---|:---|:---|:---|
| `_id` | ObjectId | Unique identifier | Auto-generated |
| `name` | String | User display name | Required, Min 2, Max 50 |
| `email` | String | Email address | Required, Unique, Valid Email |
| `password` | String | Hashed password | Required, Min 6 (hashed) |
| `role` | String | User role | 'admin' or 'viewer' (default) |
| `bio` | String | User biography | Max 500 chars |
| `createdAt` | Date | Registration date | Default: now |

## Observation

Collection: `observations`

| Field | Type | Description | Constraints |
|:---|:---|:---|:---|
| `_id` | ObjectId | Unique identifier | Auto-generated |
| `title` | String | Observation title | Required, 3-100 chars |
| `description` | String | Detailed description | Required, 10-2000 chars |
| `userId` | ObjectId | Reference to User | Required |
| `location` | GeoJSON | Geographic location | Point [lng, lat] |
| `date` | Date | Date of observation | Default: now |
| `type` | String | Type of phenomenon | Enum (WAV, LIGHT, etc.) |
| `tags` | [String] | List of tags | Array of strings |
| `images` | [Object] | List of images | Cloudinary info |
| `createdAt` | Date | Creation timestamp | Default: now |

### Image Object Structure
```json
{
  "publicId": "String",
  "url": "String",
  "size": "Number",
  "format": "String"
}
```

## Comment

Collection: `comments`

| Field | Type | Description | Constraints |
|:---|:---|:---|:---|
| `_id` | ObjectId | Unique identifier | Auto-generated |
| `text` | String | Comment content | Required, 1-500 chars |
| `userId` | ObjectId | Reference to User | Required |
| `observationId` | ObjectId | Reference to Observation | Required |
| `createdAt` | Date | Creation timestamp | Default: now |

## Indexes

- **User**: `email` (unique), `createdAt`
- **Observation**: `location` (2dsphere for geo-queries), `title/description/tags` (text index for search), `userId`, `createdAt`
- **Comment**: `observationId`, `userId`, `createdAt`
