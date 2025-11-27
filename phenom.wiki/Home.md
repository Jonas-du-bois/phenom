# Welcome to the Phenom Wiki!

Phenom is a modern web application for reporting UFO/UAP observations with interactive geolocation, photo capture, and a community of observers.

## 📚 Documentation Sections

### [Quick Start](Quick-Start)
Get started with Phenom in 5 minutes. Learn how to set up the environment and run the application.

### [API Endpoints](API-Endpoints)
Detailed documentation of the REST API endpoints, including authentication, observations, and user management.

### [Backend Architecture](Backend-Architecture)
Deep dive into the Node.js/Express backend architecture, directory structure, and key components.

### [Frontend Architecture](Frontend-Architecture)
Overview of the Vue.js 3 frontend structure, state management, and component organization.

### [Database Schema](Database-Schema)
Understanding the MongoDB data models: Users, Observations, and Comments.

### [Deployment Guide](Deployment-Guide)
How to deploy Phenom to production using Docker and platforms like Render.com.

---

## 🏗️ Technical Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.18
- **Database**: MongoDB Atlas with Mongoose 8
- **Authentication**: JWT (jsonwebtoken)
- **Upload**: Multer + Cloudinary
- **Validation**: Express-validator
- **Documentation**: Swagger/OpenAPI 3.0
- **Tests**: Jest + Supertest

### Frontend
- **Framework**: Vue.js 3.4 (Composition API)
- **Build**: Vite 5
- **Router**: Vue Router 4
- **State**: Pinia 2
- **Map**: Leaflet 1.9
- **Styling**: Tailwind CSS 3.4
