# Contributing to Phenom

Thank you for your interest in contributing to Phenom! This document provides guidelines for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Process](#development-process)
- [Pull Request Process](#pull-request-process)
- [Coding Guidelines](#coding-guidelines)
- [Commit Guidelines](#commit-guidelines)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)
- [Community](#community)

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors, regardless of:
- Experience level
- Gender identity and expression
- Sexual orientation
- Disability
- Personal appearance
- Body size
- Race
- Ethnicity
- Age
- Religion
- Nationality

### Our Standards

**Positive behavior includes**:
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Accepting constructive criticism gracefully
- Focusing on what's best for the community
- Showing empathy towards others

**Unacceptable behavior includes**:
- Harassment, trolling, or insulting comments
- Public or private harassment
- Publishing others' private information
- Any conduct inappropriate in a professional setting

### Enforcement

Violations of the code of conduct may result in temporary or permanent bans from the project.

## Getting Started

### Prerequisites

Before contributing, ensure you have:
- **Node.js 18+** and **npm 9+**
- **Git** installed
- **Docker Desktop** (optional but recommended)
- GitHub account
- Basic knowledge of JavaScript/Vue.js

### Fork and Clone

1. **Fork the repository** on GitHub
   - Visit [github.com/Jonas-du-bois/phenom](https://github.com/Jonas-du-bois/phenom)
   - Click "Fork" button

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR-USERNAME/phenom.git
   cd phenom
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/Jonas-du-bois/phenom.git
   ```

4. **Setup development environment**
   ```bash
   cp .env.example .env
   # Edit .env with your values
   docker-compose up -d
   ```

## How to Contribute

### Types of Contributions

We welcome:
- 🐛 **Bug fixes**
- ✨ **New features**
- 📚 **Documentation improvements**
- 🎨 **UI/UX enhancements**
- ✅ **Tests**
- ♻️ **Code refactoring**
- 🌐 **Translations**
- 🔒 **Security improvements**

### First Time Contributors

Look for issues labeled:
- `good first issue` - Perfect for newcomers
- `help wanted` - Need assistance
- `beginner friendly` - Easy to tackle

Example first contributions:
- Fix typos in documentation
- Add comments to complex code
- Improve error messages
- Add unit tests
- Update outdated documentation

## Development Process

### 1. Choose an Issue

- Browse [open issues](https://github.com/Jonas-du-bois/phenom/issues)
- Comment on the issue to claim it
- Wait for maintainer approval
- Ask questions if unclear

### 2. Create a Branch

```bash
# Update your fork
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name
```

**Branch naming**:
- `feature/add-user-settings` - New feature
- `fix/cors-error` - Bug fix
- `docs/update-readme` - Documentation
- `refactor/observation-service` - Code refactoring

### 3. Make Changes

- Write clean, readable code
- Follow existing coding style
- Add comments for complex logic
- Write tests for new features
- Update documentation

### 4. Test Your Changes

```bash
# Backend tests
cd backend
npm test
npm run lint

# Frontend tests
cd frontend
npm test
npm run lint

# Manual testing
docker-compose up -d
# Test in browser
```

### 5. Commit Your Changes

```bash
git add .
git commit -m "feat: add user settings page"
```

See [Commit Guidelines](#commit-guidelines) for commit message format.

### 6. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 7. Open Pull Request

- Go to your fork on GitHub
- Click "New Pull Request"
- Select your branch
- Fill in PR template
- Submit for review

## Pull Request Process

### Before Submitting

Checklist:
- [ ] Code follows project style guidelines
- [ ] All tests pass (`npm test`)
- [ ] Linting passes (`npm run lint`)
- [ ] Documentation is updated
- [ ] Commit messages follow conventions
- [ ] Branch is up to date with `main`
- [ ] No merge conflicts

### PR Template

```markdown
## Description
Brief description of changes

## Related Issue
Fixes #123

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How did you test your changes?

## Screenshots (if applicable)
Before/after screenshots for UI changes

## Checklist
- [ ] Tests pass
- [ ] Linting passes
- [ ] Documentation updated
```

### Review Process

1. **Automated Checks**
   - CI/CD pipeline runs tests
   - Linting checks
   - Build verification

2. **Code Review**
   - Maintainer reviews code
   - Feedback provided via comments
   - Changes requested if needed

3. **Address Feedback**
   - Make requested changes
   - Push additional commits
   - Comment when done

4. **Approval and Merge**
   - After approval, maintainer merges
   - Branch is deleted
   - Issue is closed

### After Merge

- Update your local repository:
  ```bash
  git checkout main
  git pull upstream main
  ```
- Delete your feature branch:
  ```bash
  git branch -d feature/your-feature-name
  ```

## Coding Guidelines

### General Principles

1. **KISS** - Keep It Simple, Stupid
2. **DRY** - Don't Repeat Yourself
3. **YAGNI** - You Aren't Gonna Need It
4. **SOLID** - Object-oriented design principles

### JavaScript Style

Follow the existing code style:

**Backend (Node.js)**:
```javascript
// Good
import express from 'express'

export const createUser = async (req, res, next) => {
  try {
    const { name, email } = req.body
    const user = await userService.create({ name, email })
    
    return res.status(201).json({
      success: true,
      data: user
    })
  } catch (error) {
    next(error)
  }
}

// Bad
const express = require('express')  // Don't use require

exports.createUser = function(req, res, next) {  // Don't use function
  userService.create(req.body).then((user) => {  // Don't use .then()
    res.json(user)  // Don't forget success wrapper
  }).catch(next)
}
```

**Frontend (Vue.js)**:
```vue
<!-- Good -->
<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  title: String
})

const items = ref([])

const count = computed(() => items.value.length)

onMounted(async () => {
  items.value = await fetchItems()
})
</script>

<!-- Bad -->
<script>
export default {  // Don't use Options API
  data() {
    return {
      items: []
    }
  },
  computed: {
    count() {
      return this.items.length
    }
  }
}
</script>
```

### Testing Requirements

**New Features**:
- Must include tests
- Minimum 80% code coverage
- Test happy path and edge cases

**Bug Fixes**:
- Add test reproducing the bug
- Verify test fails before fix
- Verify test passes after fix

**Example Test**:
```javascript
describe('User Service', () => {
  it('should create user with valid data', async () => {
    const userData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123'
    }
    
    const user = await userService.create(userData)
    
    expect(user).toBeDefined()
    expect(user.email).toBe('john@example.com')
  })
  
  it('should reject invalid email', async () => {
    const userData = {
      name: 'John Doe',
      email: 'invalid-email',
      password: 'password123'
    }
    
    await expect(userService.create(userData))
      .rejects.toThrow('Invalid email')
  })
})
```

### Documentation

**Code Comments**:
```javascript
// Good - Explain WHY, not WHAT
// Use UTC timestamps to avoid timezone issues
const timestamp = new Date().toISOString()

// Bad - States the obvious
// Set timestamp to current date
const timestamp = new Date()
```

**JSDoc for Public APIs**:
```javascript
/**
 * Creates a new observation
 * @param {string} userId - User ID
 * @param {Object} data - Observation data
 * @param {string} data.title - Title (3-100 chars)
 * @param {string} data.description - Description (10-2000 chars)
 * @param {Object} data.location - GeoJSON Point
 * @returns {Promise<Observation>} Created observation
 * @throws {ValidationError} If data is invalid
 */
export const createObservation = async (userId, data) => {
  // Implementation
}
```

**Update README**:
- If adding new feature, update Features section
- If changing setup, update Installation section
- If adding dependencies, update Dependencies section

## Commit Guidelines

### Conventional Commits

We use [Conventional Commits](https://www.conventionalcommits.org/) format:

```
type(scope): subject

body (optional)

footer (optional)
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style (formatting, semicolons, etc.)
- `refactor`: Code change that neither fixes bug nor adds feature
- `test`: Adding or updating tests
- `chore`: Maintenance (dependencies, config, etc.)
- `perf`: Performance improvement
- `ci`: CI/CD changes

### Scopes

- `auth` - Authentication
- `api` - Backend API
- `ui` - Frontend UI
- `db` - Database
- `tests` - Tests
- `deps` - Dependencies
- `docs` - Documentation

### Examples

```bash
# Good commits
feat(auth): add password reset functionality
fix(api): correct observation geolocation format
docs(readme): update installation instructions
style(ui): format component files with prettier
refactor(db): extract database connection logic
test(auth): add JWT token expiration tests
chore(deps): update mongoose to v8.0.3

# Bad commits
update stuff
fix bug
changes
WIP
```

### Commit Message Rules

1. **Use imperative mood**: "add" not "added" or "adds"
2. **No period at end** of subject line
3. **Capitalize first letter** of subject
4. **Limit subject to 72 characters**
5. **Separate subject from body** with blank line
6. **Use body to explain** what and why (not how)

## Reporting Bugs

### Before Reporting

1. **Check existing issues** - Bug may already be reported
2. **Check documentation** - May be expected behavior
3. **Try latest version** - Bug may be fixed

### Bug Report Template

```markdown
**Describe the bug**
Clear description of the bug

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen

**Screenshots**
If applicable, add screenshots

**Environment:**
- OS: [e.g., Windows 10, macOS 12]
- Browser: [e.g., Chrome 95, Firefox 94]
- Node version: [e.g., 18.12.0]
- Docker version: [e.g., 20.10.0]

**Additional context**
Any other relevant information
```

### Bug Priority Labels

- `critical` - Crashes, data loss, security
- `high` - Major functionality broken
- `medium` - Feature partially works
- `low` - Minor issue, cosmetic

## Suggesting Features

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
Description of the problem

**Describe the solution you'd like**
Clear description of desired feature

**Describe alternatives you've considered**
Other solutions you've thought about

**Additional context**
Mockups, examples, etc.
```

### Feature Discussion

1. **Open Discussion** issue first
2. **Explain use case** and benefits
3. **Wait for feedback** from maintainers
4. **Refine proposal** based on feedback
5. **Get approval** before implementing

## Community

### Communication Channels

- **GitHub Issues**: Bug reports, feature requests
- **GitHub Discussions**: Questions, ideas, showcase
- **Pull Requests**: Code contributions

### Getting Help

- Read [Documentation](Home)
- Search [existing issues](https://github.com/Jonas-du-bois/phenom/issues)
- Open new issue with details
- Be patient and respectful

### Recognition

Contributors are recognized:
- Listed in README contributors section
- Mentioned in release notes
- GitHub contributor badge

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Questions?

If you have questions about contributing:
1. Check [Development Guide](Development-Guide)
2. Open a Discussion on GitHub
3. Contact maintainers

Thank you for contributing to Phenom! 🚀👽
