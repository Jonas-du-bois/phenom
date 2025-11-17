# Image Upload & Processing

Phenom uses **Cloudinary** as a CDN for image storage and processing, replacing local storage and GridFS for better performance, scalability, and reliability.

## Overview

Images in Phenom are:
- Uploaded directly to Cloudinary from the backend
- Automatically optimized (compression, format conversion)
- Served via global CDN for fast delivery
- Secured with Cloudinary credentials
- Referenced in MongoDB by public ID and URL

## Technology Stack

- **CDN Provider**: [Cloudinary](https://cloudinary.com)
- **Image Processing**: Sharp 0.34 (optional local processing)
- **Backend Integration**: Cloudinary SDK 2.8
- **Format Support**: JPEG, PNG, WebP
- **Max File Size**: 10MB
- **Max Dimensions**: 1920x1920px

## Architecture

```
┌─────────────────┐
│   Frontend      │
│   (Vue.js)      │
└────────┬────────┘
         │
    (1) Select image
         │
         ▼
┌─────────────────────────────┐
│      Backend API            │
│  POST /api/v1/images/upload │
└────────┬────────────────────┘
         │
    (2) Receive file (Multer)
         │
    (3) Validate (type, size)
         │
    (4) Upload to Cloudinary
         │
         ▼
┌─────────────────────────────┐
│    Cloudinary CDN           │
│  • Auto-compression         │
│  • Format optimization      │
│  • Resize if needed         │
│  • Generate HTTPS URL       │
└────────┬────────────────────┘
         │
    (5) Return metadata
         │
         ▼
┌─────────────────────────────┐
│      Backend API            │
│  • Store publicId, URL      │
│  • Save to MongoDB          │
└────────┬────────────────────┘
         │
    (6) Return response
         │
         ▼
┌─────────────────┐
│   Frontend      │
│  • Display image│
│  • Save form    │
└─────────────────┘
```

## Cloudinary Configuration

### Setup (backend/src/config/cloudinary.js)

```javascript
import { v2 as cloudinary } from 'cloudinary'

// Initialize from CLOUDINARY_URL environment variable
// Format: cloudinary://api_key:api_secret@cloud_name
const cloudinaryUrl = process.env.CLOUDINARY_URL
const [, api_key, api_secret, cloud_name] = 
  cloudinaryUrl.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/)

cloudinary.config({
  cloud_name,
  api_key,
  api_secret,
  secure: true  // Always use HTTPS
})
```

### Environment Variable

```bash
# .env
CLOUDINARY_URL=cloudinary://123456789012345:AbCdEfGhIjKlMnOpQrStUvWx@your-cloud-name
```

**Get your Cloudinary URL**:
1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Dashboard → Account Details
3. Copy "API Environment variable"

## Image Upload Flow

### 1. Frontend - Image Selection

**ImageManager Component** (components/ImageManager.vue):
```vue
<script setup>
import { ref } from 'vue'
import { useImageUpload } from '@/composables/useImageUpload'

const { images, previews, selectImages, uploadImages, removeImage } = useImageUpload()

const handleFileSelect = (event) => {
  const files = Array.from(event.target.files)
  selectImages(files)
}

const handleUpload = async () => {
  try {
    const uploadedImages = await uploadImages()
    // uploadedImages contains Cloudinary metadata
    console.log('Uploaded:', uploadedImages)
  } catch (error) {
    console.error('Upload failed:', error)
  }
}
</script>

<template>
  <div class="image-manager">
    <!-- File input -->
    <input
      type="file"
      accept="image/jpeg,image/png,image/webp"
      multiple
      @change="handleFileSelect"
    />
    
    <!-- Preview thumbnails -->
    <div class="preview-grid">
      <div v-for="(preview, index) in previews" :key="index">
        <img :src="preview" alt="Preview" />
        <button @click="removeImage(index)">Remove</button>
      </div>
    </div>
    
    <!-- Upload button -->
    <button @click="handleUpload">Upload Images</button>
  </div>
</template>
```

### 2. Frontend - Upload to Backend

**useImageUpload Composable** (composables/useImageUpload.js):
```javascript
import { ref } from 'vue'
import { imageService } from '@/services/imageService'

export const useImageUpload = () => {
  const images = ref([])
  const previews = ref([])
  const uploading = ref(false)
  
  const selectImages = (files) => {
    files.forEach(file => {
      // Validate file type
      if (!file.type.match(/image\/(jpeg|jpg|png|webp)/)) {
        console.error('Invalid file type:', file.type)
        return
      }
      
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        console.error('File too large:', file.size)
        return
      }
      
      // Add to images
      images.value.push(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        previews.value.push(e.target.result)
      }
      reader.readAsDataURL(file)
    })
  }
  
  const uploadImages = async () => {
    uploading.value = true
    const uploadedImages = []
    
    try {
      for (const image of images.value) {
        const formData = new FormData()
        formData.append('image', image)
        
        // Upload to backend
        const response = await imageService.upload(formData)
        uploadedImages.push(response.data)
      }
      
      return uploadedImages
    } finally {
      uploading.value = false
    }
  }
  
  const removeImage = (index) => {
    images.value.splice(index, 1)
    previews.value.splice(index, 1)
  }
  
  const clearImages = () => {
    images.value = []
    previews.value = []
  }
  
  return {
    images,
    previews,
    uploading,
    selectImages,
    uploadImages,
    removeImage,
    clearImages
  }
}
```

**Image Service** (services/imageService.js):
```javascript
import api from '@/utils/api'

export const imageService = {
  upload: (formData) => {
    return api.post('/api/v1/images/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },
  
  delete: (publicId) => {
    return api.delete(`/api/v1/images/${publicId}`)
  }
}
```

### 3. Backend - Receive Upload

**Image Routes** (routes/image.routes.js):
```javascript
import express from 'express'
import multer from 'multer'
import { authenticate } from '../middleware/auth.js'
import { uploadImage, deleteImage } from '../controllers/image.controller.js'

const router = express.Router()

// Multer memory storage (no disk writes)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024  // 10MB
  },
  fileFilter: (req, file, cb) => {
    // Accept only images
    if (file.mimetype.match(/^image\/(jpeg|jpg|png|webp)$/)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type'), false)
    }
  }
})

router.post('/images/upload', authenticate, upload.single('image'), uploadImage)
router.delete('/images/:publicId', authenticate, deleteImage)

export default router
```

**Image Controller** (controllers/image.controller.js):
```javascript
import { uploadImage as cloudinaryUpload } from '../config/cloudinary.js'

export const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided'
      })
    }
    
    // Upload to Cloudinary
    const result = await cloudinaryUpload(req.file.buffer, {
      folder: 'phenom/observations',
      quality: 85,
      maxWidth: 1920,
      maxHeight: 1920
    })
    
    // Return metadata
    return res.status(200).json({
      success: true,
      data: {
        publicId: result.public_id,
        url: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        size: result.bytes
      }
    })
  } catch (error) {
    next(error)
  }
}

export const deleteImage = async (req, res, next) => {
  try {
    const { publicId } = req.params
    
    // Delete from Cloudinary
    await cloudinaryDelete(publicId)
    
    return res.json({
      success: true,
      message: 'Image deleted successfully'
    })
  } catch (error) {
    next(error)
  }
}
```

### 4. Cloudinary - Process and Store

**Upload Function** (config/cloudinary.js):
```javascript
export const uploadImage = async (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder || 'phenom/observations',
        public_id: options.public_id,
        transformation: [
          {
            width: options.maxWidth || 1920,
            height: options.maxHeight || 1920,
            crop: 'limit',              // Don't upscale
            quality: options.quality || 85,
            fetch_format: 'auto'        // Auto WebP if supported
          }
        ],
        resource_type: 'image'
      },
      (error, result) => {
        if (error) reject(error)
        else resolve(result)
      }
    )
    
    uploadStream.end(buffer)
  })
}
```

**Transformations Applied**:
- **Resize**: Limit to 1920x1920 (preserve aspect ratio)
- **Quality**: 85% compression
- **Format**: Auto-select (WebP for modern browsers, JPEG fallback)
- **Folder**: `phenom/observations/`

### 5. Save to MongoDB

**Observation Model** (models/Observation.js):
```javascript
images: [{
  publicId: {
    type: String,
    required: true,
    comment: 'Cloudinary public_id'
  },
  url: {
    type: String,
    required: true,
    comment: 'Cloudinary HTTPS URL'
  },
  size: {
    type: Number,
    required: true,
    comment: 'File size in bytes'
  },
  format: {
    type: String,
    required: true,
    comment: 'Image format (jpeg, png, webp)'
  },
  width: Number,
  height: Number,
  uploadedAt: {
    type: Date,
    default: Date.now
  }
}]
```

**Create Observation with Images**:
```javascript
// observation.service.js
export const create = async (userId, data) => {
  const observation = new Observation({
    title: data.title,
    description: data.description,
    location: data.location,
    userId: userId,
    images: data.images,  // Array of Cloudinary metadata
    type: data.type,
    tags: data.tags
  })
  
  await observation.save()
  return observation
}
```

## Image Deletion

### When to Delete Images

Images are deleted when:
1. User deletes observation
2. User updates observation and removes images
3. Admin deletes observation

### Deletion Flow

**Delete Observation**:
```javascript
// observation.service.js
export const deleteObservation = async (id) => {
  const observation = await Observation.findById(id)
  
  if (!observation) {
    throw new Error('Observation not found')
  }
  
  // Delete all images from Cloudinary
  for (const image of observation.images) {
    await cloudinaryDelete(image.publicId)
  }
  
  // Delete observation from DB
  await observation.deleteOne()
}
```

**Delete Single Image**:
```javascript
import { deleteImage as cloudinaryDelete } from '../config/cloudinary.js'

export const deleteImage = async (publicId) => {
  try {
    const result = await cloudinaryDelete(publicId)
    return result
  } catch (error) {
    throw new Error(`Failed to delete image: ${error.message}`)
  }
}
```

## Image Display

### Frontend - Display Images

**Observation Card**:
```vue
<template>
  <div class="observation-card">
    <!-- Single image -->
    <img
      v-if="observation.images.length > 0"
      :src="observation.images[0].url"
      :alt="observation.title"
      class="observation-image"
    />
    
    <!-- Image gallery -->
    <div v-if="observation.images.length > 1" class="image-gallery">
      <img
        v-for="image in observation.images"
        :key="image.publicId"
        :src="image.url"
        :alt="observation.title"
        class="gallery-image"
      />
    </div>
  </div>
</template>
```

### Responsive Images

**Cloudinary Transformations**:
```javascript
// Generate responsive image URL
const getResponsiveImage = (publicId, width) => {
  return cloudinary.url(publicId, {
    width: width,
    crop: 'fill',
    quality: 'auto',
    fetch_format: 'auto'
  })
}

// Usage
<img
  :src="getResponsiveImage(image.publicId, 800)"
  :srcset="`
    ${getResponsiveImage(image.publicId, 400)} 400w,
    ${getResponsiveImage(image.publicId, 800)} 800w,
    ${getResponsiveImage(image.publicId, 1200)} 1200w
  `"
  sizes="(max-width: 600px) 400px, (max-width: 1200px) 800px, 1200px"
/>
```

## Configuration Options

### Image Processing (config/image.config.js)

```javascript
export const imageConfig = {
  // Quality (0-100)
  quality: 85,
  
  // Max dimensions
  maxWidth: 1920,
  maxHeight: 1920,
  
  // Max file size (bytes)
  maxFileSize: 10 * 1024 * 1024,  // 10MB
  
  // Allowed formats
  allowedFormats: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  
  // Compression by format
  jpeg: {
    quality: 85,
    progressive: true,
    mozjpeg: true
  },
  
  png: {
    quality: 85,
    compressionLevel: 9
  },
  
  webp: {
    quality: 85,
    effort: 6
  }
}
```

### Cloudinary Transformations

**Common Transformations**:
```javascript
// Thumbnail (200x200)
cloudinary.url(publicId, {
  width: 200,
  height: 200,
  crop: 'fill',
  gravity: 'auto'
})

// Responsive (auto width)
cloudinary.url(publicId, {
  width: 'auto',
  crop: 'scale',
  dpr: 'auto'
})

// Format optimization
cloudinary.url(publicId, {
  fetch_format: 'auto',
  quality: 'auto'
})
```

## Security

### File Validation

**Server-side Validation**:
```javascript
// Multer file filter
fileFilter: (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'))
  }
}

// File size limit
limits: {
  fileSize: 10 * 1024 * 1024  // 10MB
}
```

### Authentication

All upload/delete endpoints require JWT authentication:
```javascript
router.post('/images/upload', authenticate, upload.single('image'), uploadImage)
router.delete('/images/:publicId', authenticate, deleteImage)
```

### Cloudinary Security

- **Secure URLs**: Always use HTTPS (`secure: true`)
- **Private API Keys**: Never expose in frontend
- **Signed Uploads**: Use signed URLs for direct uploads (optional)
- **Access Control**: Cloudinary URLs are public but obscure

## Performance

### CDN Benefits

- **Global Distribution**: Images served from nearest edge location
- **Auto-Caching**: Cloudinary caches transformed images
- **Compression**: Automatic format and quality optimization
- **Lazy Loading**: Use browser native lazy loading

### Optimization Tips

1. **Use fetch_format: 'auto'** - Serves WebP to supported browsers
2. **Use quality: 'auto'** - Cloudinary chooses optimal quality
3. **Lazy load images** - Add `loading="lazy"` attribute
4. **Use responsive images** - srcset for different screen sizes
5. **Cache aggressively** - Cloudinary sets long cache headers

## Error Handling

### Upload Errors

```javascript
try {
  const result = await uploadImage(buffer, options)
} catch (error) {
  if (error.http_code === 400) {
    // Invalid parameters
  } else if (error.http_code === 401) {
    // Authentication failed
  } else if (error.http_code === 420) {
    // Rate limit exceeded
  } else {
    // Other errors
  }
}
```

### Frontend Error Handling

```javascript
const handleUpload = async () => {
  try {
    const uploaded = await uploadImages()
    toast.success('Images uploaded successfully')
  } catch (error) {
    if (error.response?.status === 400) {
      toast.error('Invalid image file')
    } else if (error.response?.status === 413) {
      toast.error('File too large (max 10MB)')
    } else {
      toast.error('Upload failed. Please try again.')
    }
  }
}
```

## Troubleshooting

### "CLOUDINARY_URL not defined"

**Problem**: Missing or invalid Cloudinary configuration.

**Solution**:
1. Sign up at cloudinary.com
2. Get API Environment variable from dashboard
3. Add to `.env`: `CLOUDINARY_URL=cloudinary://...`

### Upload Fails with 401

**Problem**: Invalid Cloudinary credentials.

**Solution**: Verify `CLOUDINARY_URL` format and credentials.

### Images Not Displaying

**Problem**: CORS or invalid URLs.

**Solution**:
1. Check image URLs in response
2. Verify HTTPS URLs are returned
3. Check browser console for CORS errors

### Large Upload Times

**Problem**: Images are too large.

**Solution**:
1. Reduce max file size limit
2. Compress images before upload (frontend)
3. Use Cloudinary auto-quality

## Migration from GridFS

If migrating from GridFS to Cloudinary:

```javascript
// Migration script
import Observation from './models/Observation.js'
import { uploadImage } from './config/cloudinary.js'
import fs from 'fs'

const migrateImages = async () => {
  const observations = await Observation.find({ 'images.path': { $exists: true } })
  
  for (const obs of observations) {
    const newImages = []
    
    for (const image of obs.images) {
      // Read image from GridFS/local storage
      const buffer = fs.readFileSync(image.path)
      
      // Upload to Cloudinary
      const result = await uploadImage(buffer)
      
      newImages.push({
        publicId: result.public_id,
        url: result.secure_url,
        size: result.bytes,
        format: result.format,
        width: result.width,
        height: result.height
      })
      
      // Delete old file
      fs.unlinkSync(image.path)
    }
    
    // Update observation
    obs.images = newImages
    await obs.save()
  }
}
```

## Related Documentation

- [Backend Architecture](Backend-Architecture) - Backend structure
- [Frontend Architecture](Frontend-Architecture) - Frontend integration
- [API Reference](API-Reference) - Image upload endpoints
- [Environment Variables](Environment-Variables) - Configuration
