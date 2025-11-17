# Phenom Wiki Documentation

This directory contains comprehensive documentation for the Phenom UFO observation platform.

## Documentation Overview

Total: **14 wiki pages** | **228KB** of documentation

### Quick Navigation

| Page | Size | Description |
|------|------|-------------|
| [Home](Home.md) | 4KB | Main wiki landing page with navigation index |
| [Getting Started](Getting-Started.md) | 5KB | Quick start guide for setting up Phenom |
| [Architecture Overview](Architecture-Overview.md) | 15KB | High-level system architecture and diagrams |
| [Backend Architecture](Backend-Architecture.md) | 18KB | Complete Node.js/Express backend documentation |
| [Frontend Architecture](Frontend-Architecture.md) | 21KB | Complete Vue.js 3 frontend documentation |
| [Database Schema](Database-Schema.md) | 18KB | MongoDB collections, models, and relationships |
| [WebSocket Integration](WebSocket-Integration.md) | 18KB | Real-time updates with WsMini PubSub |
| [Image Upload & Processing](Image-Upload-Processing.md) | 18KB | Cloudinary CDN integration and image handling |
| [Observation Types](Observation-Types.md) | 9KB | 27 UFO phenomenon classification codes |
| [Environment Variables](Environment-Variables.md) | 12KB | Complete configuration reference |
| [Deployment Guide](Deployment-Guide.md) | 14KB | Production deployment to Render.com and Docker |
| [Troubleshooting](Troubleshooting.md) | 13KB | Common issues and solutions |
| [Development Guide](Development-Guide.md) | 15KB | Local development practices and standards |
| [Contributing](Contributing.md) | 13KB | Contribution guidelines and code of conduct |

## Key Features Documented

### Backend
- **Runtime**: Node.js 18+ with Express.js 4.18
- **Database**: MongoDB Atlas with Mongoose 8
- **Authentication**: JWT with refresh tokens
- **Image Storage**: Cloudinary CDN
- **Real-time**: WebSocket with WsMini
- **Security**: Helmet, CORS, rate limiting, validation
- **Testing**: Jest + Supertest

### Frontend
- **Framework**: Vue.js 3.4 (Composition API)
- **Build**: Vite 5
- **State**: Pinia 2
- **Router**: Vue Router 4
- **Maps**: Leaflet 1.9
- **Styling**: Tailwind CSS 3.4
- **Testing**: Vitest + Vue Test Utils
- **PWA**: Installable progressive web app

### Infrastructure
- **Containers**: Docker + Docker Compose
- **Database**: MongoDB Atlas (cloud)
- **CDN**: Cloudinary for images
- **Deployment**: Render.com ready
- **CI/CD**: GitHub Actions compatible

## Documentation Philosophy

All documentation in this wiki was created by:

1. **Analyzing the actual codebase** - Every file in backend/ and frontend/ was reviewed
2. **Documenting real implementation** - Not assumptions or planned features
3. **Providing practical examples** - Code snippets from actual implementation
4. **Including troubleshooting** - Based on common real-world issues
5. **Maintaining accuracy** - Technical details verified against source code

## How to Use This Documentation

### For New Users
1. Start with [Getting Started](Getting-Started.md)
2. Read [Architecture Overview](Architecture-Overview.md)
3. Set up environment using [Environment Variables](Environment-Variables.md)
4. Refer to [Troubleshooting](Troubleshooting.md) if issues arise

### For Developers
1. Read [Development Guide](Development-Guide.md)
2. Review [Backend Architecture](Backend-Architecture.md) or [Frontend Architecture](Frontend-Architecture.md)
3. Check [Database Schema](Database-Schema.md) for data models
4. Follow [Contributing](Contributing.md) guidelines

### For Deployment
1. Review [Environment Variables](Environment-Variables.md)
2. Follow [Deployment Guide](Deployment-Guide.md)
3. Use [Troubleshooting](Troubleshooting.md) for issues

### For Feature Understanding
- **Real-time updates**: [WebSocket Integration](WebSocket-Integration.md)
- **Image handling**: [Image Upload & Processing](Image-Upload-Processing.md)
- **UFO classifications**: [Observation Types](Observation-Types.md)

## Publishing to GitHub Wiki

To publish these pages to the GitHub Wiki:

### Method 1: Manual Upload (Recommended)

1. Go to https://github.com/Jonas-du-bois/phenom/wiki
2. Click "New Page" or "Edit" for existing pages
3. Copy content from wiki/*.md files
4. Save each page

### Method 2: Clone Wiki Repository

```bash
# Clone the wiki repository
git clone https://github.com/Jonas-du-bois/phenom.wiki.git

# Copy wiki files
cp -r wiki/*.md phenom.wiki/

# Push to wiki
cd phenom.wiki
git add .
git commit -m "Update wiki documentation"
git push
```

## Maintenance

### Keeping Documentation Updated

When making code changes:

1. **Backend changes**: Update [Backend Architecture](Backend-Architecture.md)
2. **Frontend changes**: Update [Frontend Architecture](Frontend-Architecture.md)
3. **New features**: Update [Architecture Overview](Architecture-Overview.md)
4. **Config changes**: Update [Environment Variables](Environment-Variables.md)
5. **New dependencies**: Update relevant architecture docs
6. **Breaking changes**: Update [Getting Started](Getting-Started.md) and [Deployment Guide](Deployment-Guide.md)

### Documentation Checklist

When updating:
- [ ] Content is accurate to current codebase
- [ ] Code examples are tested and working
- [ ] Links to other wiki pages are valid
- [ ] Markdown formatting is correct
- [ ] No sensitive information (passwords, keys)
- [ ] Screenshots are up-to-date (if applicable)

## Version

- **Documentation Version**: 1.0.0
- **Last Updated**: November 2024
- **Covers**: Phenom v1.0.0
- **Based on**: Actual codebase analysis

## Contributing to Documentation

See [Contributing](Contributing.md) for guidelines on improving documentation.

Documentation contributions are welcome for:
- Clarifying unclear sections
- Adding examples
- Fixing typos or errors
- Translating to other languages
- Adding diagrams or screenshots

## License

This documentation is part of the Phenom project and is licensed under the MIT License.

---

**Need Help?**
- Check the [Troubleshooting](Troubleshooting.md) guide
- Open an issue on GitHub
- Review the [Getting Started](Getting-Started.md) guide
