# Phenom Wiki - UFO Observation Platform

Welcome to the comprehensive technical documentation for **Phenom**, a modern web application for reporting and tracking UFO observations with interactive geolocation, photo capture, and community features.

## 📚 Documentation Index

### Getting Started
- [Quick Start Guide](Getting-Started) - Get up and running in 5 minutes
- [Installation Guide](Installation) - Detailed installation instructions
- [Development Setup](Development-Setup) - Local development environment setup

### Architecture & Design
- [Architecture Overview](Architecture-Overview) - High-level system architecture
- [Backend Architecture](Backend-Architecture) - Node.js/Express API structure
- [Frontend Architecture](Frontend-Architecture) - Vue.js 3 application structure
- [Database Schema](Database-Schema) - MongoDB models and relationships

### API & Integration
- [API Reference](API-Reference) - Complete REST API documentation
- [WebSocket Integration](WebSocket-Integration) - Real-time updates with WsMini
- [Authentication & Authorization](Authentication-Authorization) - JWT-based auth system

### Features & Implementation
- [Image Upload & Processing](Image-Upload-Processing) - Cloudinary integration and image handling
- [Geolocation & Mapping](Geolocation-Mapping) - Leaflet maps and location tracking
- [Comments System](Comments-System) - User comments and discussions
- [Admin Panel](Admin-Panel) - Administrative features and controls

### Development & Deployment
- [Development Guide](Development-Guide) - Coding standards and best practices
- [Testing Guide](Testing-Guide) - Running and writing tests
- [Deployment Guide](Deployment-Guide) - Production deployment instructions
- [Docker Guide](Docker-Guide) - Container orchestration with Docker Compose

### Reference
- [Environment Variables](Environment-Variables) - Configuration options
- [Observation Types](Observation-Types) - UFO phenomenon classification codes
- [Troubleshooting](Troubleshooting) - Common issues and solutions
- [Contributing](Contributing) - How to contribute to the project

## 🎯 Project Overview

**Phenom** is a full-stack web application that enables users to:
- 📍 Report UFO observations with precise GPS coordinates
- 📸 Upload and manage observation photos (Cloudinary CDN)
- 🗺️ View observations on an interactive map (Leaflet)
- 💬 Comment and discuss observations
- 🔍 Search and filter observations by type, date, and location
- 📊 View statistics and analytics (admin)
- 🔔 Receive real-time updates via WebSocket

## 🏗️ Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.18
- **Database**: MongoDB Atlas with Mongoose 8
- **Authentication**: JWT (jsonwebtoken)
- **Image Storage**: Cloudinary (CDN)
- **Real-time**: WebSocket with WsMini
- **Documentation**: Swagger/OpenAPI 3.0
- **Testing**: Jest + Supertest

### Frontend
- **Framework**: Vue.js 3.4 (Composition API)
- **Build Tool**: Vite 5
- **Router**: Vue Router 4
- **State Management**: Pinia 2
- **HTTP Client**: Axios
- **Maps**: Leaflet 1.9
- **Styling**: Tailwind CSS 3.4
- **Icons**: Vicons Fluent
- **Testing**: Vitest + Vue Test Utils

### DevOps
- **Containerization**: Docker + Docker Compose
- **Deployment**: Render.com (ready)
- **Database**: MongoDB Atlas (cloud)
- **CDN**: Cloudinary (image hosting)

## 🚀 Quick Links

- **Live Demo**: Coming soon
- **API Documentation**: [http://localhost:3000/api-docs](http://localhost:3000/api-docs) (local)
- **Repository**: [github.com/Jonas-du-bois/phenom](https://github.com/Jonas-du-bois/phenom)
- **Issues**: [GitHub Issues](https://github.com/Jonas-du-bois/phenom/issues)

## 📖 Version Information

- **Current Version**: 1.0.0
- **API Version**: v1 (`/api/v1`)
- **Last Updated**: November 2024

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](Contributing) for details on our code of conduct and the process for submitting pull requests.

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](https://github.com/Jonas-du-bois/phenom/blob/main/LICENSE) file for details.
