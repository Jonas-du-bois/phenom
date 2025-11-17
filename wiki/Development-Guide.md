# Development Guide

This guide covers local development practices, coding standards, and best practices for contributing to Phenom.

## Development Environment Setup

### Prerequisites

- **Node.js 18+** and **npm 9+**
- **Git**
- **Docker Desktop** (optional, for containerized development)
- **VS Code** (recommended) or your preferred editor

### Clone and Setup

```bash
# Clone repository
git clone https://github.com/Jonas-du-bois/phenom.git
cd phenom

# Copy environment file
cp .env.example .env

# Edit .env with your values
nano .env
```

### Option 1: Docker Development (Recommended)

**Advantages**:
- Consistent environment
- No local dependencies needed
- Matches production environment

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**Hot Reload**:
- Frontend: Vite hot module replacement (automatic)
- Backend: Nodemon auto-restart (automatic)

### Option 2: Local Development (Without Docker)

**Backend Setup**:
```bash
cd backend
npm install
npm run dev  # Starts with nodemon on port 3000
```

**Frontend Setup** (separate terminal):
```bash
cd frontend
npm install
npm run dev  # Starts Vite dev server on port 5173
```

**MongoDB**: Use MongoDB Atlas or local MongoDB instance

## Project Structure

See [Architecture Overview](Architecture-Overview) for detailed structure.

```
phenom/
├── backend/          # Node.js/Express API
│   ├── src/         # Source code
│   ├── tests/       # Jest tests
│   └── scripts/     # Utility scripts
├── frontend/        # Vue.js SPA
│   ├── src/         # Source code
│   └── tests/       # Vitest tests
└── wiki/            # Documentation
```

## Coding Standards

### General Principles

1. **Write clean, readable code**
2. **Follow existing patterns** in the codebase
3. **Comment complex logic** but not obvious code
4. **Keep functions small** and focused
5. **Use meaningful variable names**

### JavaScript/Node.js (Backend)

**Style Guide**: Based on Standard JS

**Key Rules**:
- Use ES6+ modules (`import/export`)
- Use `const` and `let`, never `var`
- Use async/await over callbacks
- Use arrow functions where appropriate
- 2-space indentation
- Semicolons required
- Single quotes for strings

**Example**:
```javascript
import express from 'express'

export const createObservation = async (req, res, next) => {
  try {
    const { title, description, location } = req.body
    const userId = req.user._id
    
    const observation = await observationService.create({
      title,
      description,
      location,
      userId
    })
    
    return res.status(201).json({
      success: true,
      data: observation
    })
  } catch (error) {
    next(error)
  }
}
```

**JSDoc Comments** (for public APIs):
```javascript
/**
 * Creates a new observation
 * @param {Object} data - Observation data
 * @param {string} data.title - Observation title
 * @param {string} data.description - Description
 * @returns {Promise<Observation>} Created observation
 */
export const createObservation = async (data) => {
  // Implementation
}
```

### Vue.js/JavaScript (Frontend)

**Style Guide**: Vue 3 Composition API style

**Key Rules**:
- Use `<script setup>` syntax
- Use Composition API over Options API
- Use composables for reusable logic
- Props and emits must be defined
- Component names: PascalCase
- 2-space indentation

**Example Component**:
```vue
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useObservations } from '@/composables/useObservations'

// Props
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  maxItems: {
    type: Number,
    default: 10
  }
})

// Emits
const emit = defineEmits(['select', 'update'])

// Composables
const { observations, fetchObservations } = useObservations()

// State
const loading = ref(false)
const selectedId = ref(null)

// Computed
const filteredObservations = computed(() => {
  return observations.value.slice(0, props.maxItems)
})

// Methods
const handleSelect = (id) => {
  selectedId.value = id
  emit('select', id)
}

// Lifecycle
onMounted(async () => {
  loading.value = true
  await fetchObservations()
  loading.value = false
})
</script>

<template>
  <div class="observations-list">
    <h2>{{ title }}</h2>
    
    <div v-if="loading">Loading...</div>
    
    <div
      v-for="obs in filteredObservations"
      :key="obs._id"
      @click="handleSelect(obs._id)"
      class="observation-item"
    >
      {{ obs.title }}
    </div>
  </div>
</template>

<style scoped>
.observations-list {
  padding: 1rem;
}

.observation-item {
  cursor: pointer;
  padding: 0.5rem;
}

.observation-item:hover {
  background-color: #f3f4f6;
}
</style>
```

### CSS/Tailwind

**Prefer Tailwind utility classes**:
```vue
<template>
  <div class="p-4 bg-white rounded-lg shadow-md">
    <h2 class="text-2xl font-bold mb-4">Title</h2>
    <p class="text-gray-600">Content</p>
  </div>
</template>
```

**Use `<style scoped>` for custom CSS**:
```vue
<style scoped>
.custom-component {
  /* Custom styles */
}
</style>
```

## Git Workflow

### Branching Strategy

```
main (production)
  ↓
develop (integration)
  ↓
feature/feature-name
fix/bug-name
```

### Branch Naming

- Features: `feature/add-user-settings`
- Bug fixes: `fix/cors-error`
- Refactoring: `refactor/observation-service`
- Documentation: `docs/update-readme`

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

**Format**: `type(scope): description`

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style (formatting, missing semicolons)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples**:
```bash
feat(auth): add password reset functionality
fix(observations): correct geolocation coordinate order
docs(readme): update installation instructions
refactor(api): extract validation middleware
test(user): add profile update tests
chore(deps): update dependencies
```

### Pull Request Workflow

1. **Create feature branch**
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make changes and commit**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

3. **Push to GitHub**
   ```bash
   git push origin feature/my-feature
   ```

4. **Open Pull Request**
   - Go to GitHub repository
   - Click "New Pull Request"
   - Select your branch
   - Fill in description
   - Request review

5. **Code Review**
   - Address review comments
   - Push additional commits

6. **Merge**
   - After approval, merge to main
   - Delete feature branch

## Testing

### Backend Tests (Jest)

**Location**: `backend/tests/`

**Run Tests**:
```bash
cd backend

# All tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage

# Specific file
npm test auth.test.js
```

**Test Structure**:
```javascript
import request from 'supertest'
import app from '../src/app.js'
import User from '../src/models/User.js'

describe('Auth API', () => {
  beforeAll(async () => {
    // Setup (connect to test DB)
  })
  
  afterAll(async () => {
    // Cleanup (disconnect, clear DB)
  })
  
  beforeEach(async () => {
    // Clear collections before each test
    await User.deleteMany({})
  })
  
  describe('POST /api/v1/auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        })
      
      expect(response.status).toBe(201)
      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveProperty('token')
    })
    
    it('should reject duplicate email', async () => {
      // Create user
      await User.create({
        name: 'Existing',
        email: 'test@example.com',
        password: 'password123'
      })
      
      // Try to create again
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'New User',
          email: 'test@example.com',
          password: 'password123'
        })
      
      expect(response.status).toBe(400)
    })
  })
})
```

### Frontend Tests (Vitest)

**Location**: `frontend/src/tests/` (if exists)

**Run Tests**:
```bash
cd frontend

# All tests
npm test

# UI mode
npm run test:ui

# Coverage
npm run test:coverage
```

**Test Structure**:
```javascript
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseButton from '@/components/BaseButton.vue'

describe('BaseButton', () => {
  it('renders properly', () => {
    const wrapper = mount(BaseButton, {
      props: {
        variant: 'primary'
      },
      slots: {
        default: 'Click me'
      }
    })
    
    expect(wrapper.text()).toContain('Click me')
    expect(wrapper.classes()).toContain('btn-primary')
  })
  
  it('emits click event', async () => {
    const wrapper = mount(BaseButton)
    
    await wrapper.trigger('click')
    
    expect(wrapper.emitted()).toHaveProperty('click')
  })
})
```

### Writing Good Tests

**Principles**:
1. **Test behavior, not implementation**
2. **One assertion per test** (when possible)
3. **Clear test names** describing what's being tested
4. **Arrange-Act-Assert** pattern
5. **Mock external dependencies**

**Example**:
```javascript
describe('ObservationService', () => {
  it('should create observation with valid data', async () => {
    // Arrange
    const userId = new Types.ObjectId()
    const data = {
      title: 'UFO Sighting',
      description: 'Saw strange lights',
      location: {
        type: 'Point',
        coordinates: [6.14, 46.20]
      }
    }
    
    // Act
    const observation = await observationService.create(userId, data)
    
    // Assert
    expect(observation).toBeDefined()
    expect(observation.title).toBe('UFO Sighting')
    expect(observation.userId.toString()).toBe(userId.toString())
  })
})
```

## Linting

### Backend (ESLint)

```bash
cd backend

# Check code
npm run lint

# Auto-fix
npm run lint:fix
```

**Configuration**: `.eslintrc.json`

### Frontend (ESLint + Prettier)

```bash
cd frontend

# Check code
npm run lint

# Format code
npm run format
```

**Configuration**: `.eslintrc.cjs`, `.prettierrc`

## Debugging

### Backend Debugging

**VS Code** (launch.json):
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Backend",
      "program": "${workspaceFolder}/backend/src/app.js",
      "env": {
        "NODE_ENV": "development"
      },
      "envFile": "${workspaceFolder}/.env"
    }
  ]
}
```

**Console Logging**:
```javascript
console.log('Debug:', variable)
console.error('Error:', error)
console.table(arrayOfObjects)
```

**Debug Breakpoints**:
```javascript
debugger  // Pauses execution in debugger
```

### Frontend Debugging

**Vue Devtools**:
- Install browser extension
- Inspect components, state, events

**Console Logging**:
```javascript
console.log('Component data:', data)
console.warn('Warning:', message)
```

**Reactive Debugging**:
```vue
<script setup>
import { watch } from 'vue'

watch(someRef, (newVal, oldVal) => {
  console.log('Changed from', oldVal, 'to', newVal)
})
</script>
```

## Database Management

### MongoDB Shell

```bash
# Connect to MongoDB
docker-compose exec backend mongosh $MONGODB_URI

# List databases
show dbs

# Use database
use phenom_dev

# List collections
show collections

# Find documents
db.observations.find().limit(5)

# Count documents
db.observations.countDocuments()

# Create index
db.observations.createIndex({ location: "2dsphere" })
```

### Seed Data

```bash
# Seed database
docker-compose exec backend npm run seed

# Create admin user
docker-compose exec backend npm run create-admin
```

## Performance Optimization

### Backend

1. **Use Indexes**
   - Ensure indexes are created for common queries
   - Check `explain()` for slow queries

2. **Pagination**
   - Always paginate large result sets
   - Use `limit()` and `skip()`

3. **Population**
   - Only populate needed fields
   - Avoid deep population

4. **Caching**
   - Consider Redis for frequently accessed data
   - Cache in-memory for read-heavy operations

### Frontend

1. **Lazy Loading**
   - Routes are lazy-loaded by default
   - Use dynamic imports for heavy components

2. **Optimize Images**
   - Use Cloudinary transformations
   - Lazy load images

3. **Virtual Scrolling**
   - For very long lists
   - Libraries: `vue-virtual-scroller`

4. **Debounce/Throttle**
   - Search inputs
   - Scroll events

## Common Tasks

### Add New API Endpoint

1. **Define route** (`backend/src/routes/`)
2. **Create validator** (`backend/src/validators/`)
3. **Create controller** (`backend/src/controllers/`)
4. **Create service** (if needed) (`backend/src/services/`)
5. **Add tests** (`backend/tests/`)
6. **Update Swagger docs** (via JSDoc comments)

### Add New Vue Component

1. **Create component** (`frontend/src/components/`)
2. **Add props and emits**
3. **Write tests** (if complex)
4. **Use in parent component**

### Add New Page

1. **Create view** (`frontend/src/views/`)
2. **Add route** (`frontend/src/router/index.js`)
3. **Update navigation** (if needed)

## Best Practices

### Security

- ✅ Always validate user input
- ✅ Use parameterized queries
- ✅ Never log sensitive data (passwords, tokens)
- ✅ Use HTTPS in production
- ✅ Keep dependencies updated
- ✅ Use environment variables for secrets

### Error Handling

- ✅ Use try-catch for async operations
- ✅ Pass errors to next() in Express
- ✅ Provide meaningful error messages
- ✅ Log errors with context

### Documentation

- ✅ Update README when adding features
- ✅ Comment complex logic
- ✅ Keep API docs in sync
- ✅ Write clear commit messages

## Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm test                 # Run tests
npm run lint             # Check code style

# Docker
docker-compose up -d     # Start services
docker-compose logs -f   # View logs
docker-compose down      # Stop services
docker-compose ps        # List services

# Database
npm run seed             # Seed database
npm run create-admin     # Create admin
npm run check-db         # Test connection

# Production
npm run build            # Build for production
npm start                # Start production server
```

## Related Documentation

- [Getting Started](Getting-Started) - Setup guide
- [Backend Architecture](Backend-Architecture) - Backend structure
- [Frontend Architecture](Frontend-Architecture) - Frontend structure
- [Testing Guide](Testing-Guide) - Testing practices
- [Contributing](Contributing) - Contribution guidelines
