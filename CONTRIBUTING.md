# Contributing to Even G2 Calendar Companion

Thank you for your interest in contributing! This project is community-driven and welcomes contributions of all kinds.

## How to Contribute

### Reporting Bugs

**Before submitting a bug report:**
- Check existing [Issues](https://github.com/harikapadia999/even-g2-calendar-companion/issues)
- Verify you're using the latest version
- Test on a real G2 device (not just emulator)

**When submitting a bug report, include:**
- Clear, descriptive title
- Steps to reproduce
- Expected vs actual behavior
- Screenshots/videos if applicable
- Device info (phone model, OS version, G2 firmware)
- Relevant logs

**Template:**
```markdown
**Bug Description**
Clear description of the bug

**To Reproduce**
1. Step one
2. Step two
3. ...

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Environment**
- Phone: iPhone 14 Pro / Pixel 7
- OS: iOS 17.2 / Android 14
- App Version: 1.0.0
- G2 Firmware: X.X.X

**Logs**
```
Paste relevant logs here
```

**Screenshots**
Add screenshots if applicable
```

### Suggesting Features

**Before suggesting a feature:**
- Check [Discussions](https://github.com/harikapadia999/even-g2-calendar-companion/discussions)
- Consider if it fits the project scope
- Think about implementation complexity

**When suggesting a feature:**
- Use a clear, descriptive title
- Explain the problem it solves
- Describe the proposed solution
- Consider alternatives
- Provide mockups/examples if applicable

### Contributing Code

#### Development Setup

1. **Fork the repository**
   ```bash
   # Click "Fork" on GitHub
   git clone https://github.com/YOUR_USERNAME/even-g2-calendar-companion.git
   cd even-g2-calendar-companion
   ```

2. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

3. **Set up development environment**
   ```bash
   npm install
   cd ios && pod install && cd ..
   cp .env.example .env
   # Configure .env with your credentials
   ```

4. **Make your changes**
   - Follow code style guidelines (below)
   - Add tests for new features
   - Update documentation

5. **Test your changes**
   ```bash
   npm test
   npm run lint
   npm run type-check
   ```

6. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   ```

7. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

8. **Create Pull Request**
   - Go to your fork on GitHub
   - Click "New Pull Request"
   - Fill out the PR template
   - Link related issues

#### Code Style Guidelines

**TypeScript**
- Use TypeScript for all new code
- Enable strict mode
- Define interfaces for all data structures
- Avoid `any` type

**Naming Conventions**
```typescript
// Files: PascalCase for components, camelCase for utilities
BLEManager.ts
dateUtils.ts

// Classes: PascalCase
class CalendarService {}

// Interfaces: PascalCase with 'I' prefix
interface ICalendarService {}

// Functions: camelCase
function formatEventTitle() {}

// Constants: UPPER_SNAKE_CASE
const MAX_RECONNECT_ATTEMPTS = 5;

// Enums: PascalCase
enum BLEConnectionState {}
```

**Code Organization**
```typescript
// 1. Imports (grouped and sorted)
import React from 'react';
import { View, Text } from 'react-native';
import { someUtil } from '@/utils';

// 2. Types/Interfaces
interface Props {
  title: string;
}

// 3. Constants
const DEFAULT_TIMEOUT = 5000;

// 4. Component/Class
export class MyComponent {}

// 5. Exports
export default MyComponent;
```

**Comments**
```typescript
/**
 * JSDoc for public APIs
 * @param event - Calendar event to format
 * @returns Formatted display text
 */
export function formatEvent(event: CalendarEvent): string {
  // Inline comments for complex logic
  const sanitized = removeEmojis(event.title);
  return truncate(sanitized, 60);
}
```

**Error Handling**
```typescript
// Always handle errors explicitly
try {
  await riskyOperation();
} catch (error) {
  // Log with context
  console.error('Operation failed:', error);
  
  // Create typed error
  throw new CalendarError(
    CalendarErrorType.SYNC_FAILED,
    'Failed to sync calendar',
    error as Error
  );
}
```

#### Testing Guidelines

**Unit Tests**
```typescript
// Test file: MyComponent.test.ts
import { formatEvent } from './dateUtils';

describe('formatEvent', () => {
  it('should format event title correctly', () => {
    const event = {
      title: 'Team Meeting 🚀',
      // ...
    };
    
    const result = formatEvent(event);
    expect(result).toBe('Team Meeting');
  });
  
  it('should handle empty title', () => {
    const event = { title: '' };
    expect(formatEvent(event)).toBe('Untitled Event');
  });
});
```

**Integration Tests**
```typescript
describe('BLE Connection Flow', () => {
  it('should connect to G2 device', async () => {
    const manager = new BLEManager();
    await manager.initialize();
    await manager.connect(MOCK_DEVICE_ID);
    expect(manager.isConnected()).toBe(true);
  });
});
```

#### Documentation

**Update docs when:**
- Adding new features
- Changing APIs
- Fixing bugs that affect usage
- Improving architecture

**Documentation files:**
- `README.md` - Overview, features, quick start
- `docs/ARCHITECTURE.md` - System design, components
- `docs/BLE_PROTOCOL.md` - Protocol details
- `docs/SETUP.md` - Installation, configuration
- Code comments - Complex logic, public APIs

### Pull Request Guidelines

**PR Title Format:**
```
<type>: <description>

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation
- style: Code style (formatting, etc.)
- refactor: Code refactoring
- test: Adding tests
- chore: Maintenance tasks
```

**Examples:**
```
feat: add multiple event preview
fix: resolve BLE connection timeout
docs: update setup guide for Android
refactor: optimize display rendering
```

**PR Description Template:**
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Tested on iOS device
- [ ] Tested on Android device
- [ ] Tested with real G2 glasses

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests added/updated
- [ ] All tests passing

## Screenshots
Add screenshots if applicable

## Related Issues
Closes #123
```

### Code Review Process

**What reviewers look for:**
1. **Functionality** - Does it work as intended?
2. **Code Quality** - Is it clean, readable, maintainable?
3. **Tests** - Are there adequate tests?
4. **Documentation** - Is it well-documented?
5. **Performance** - Any performance concerns?
6. **Security** - Any security issues?

**Responding to feedback:**
- Be open to suggestions
- Ask questions if unclear
- Make requested changes
- Mark conversations as resolved
- Thank reviewers

### Community Guidelines

**Be respectful:**
- Use welcoming, inclusive language
- Respect differing viewpoints
- Accept constructive criticism gracefully
- Focus on what's best for the project

**Be collaborative:**
- Help others
- Share knowledge
- Give credit where due
- Celebrate contributions

**Be professional:**
- Keep discussions on-topic
- Avoid personal attacks
- Assume good intentions
- Escalate issues appropriately

## Development Workflow

### Branch Strategy

```
main (production-ready)
  ↓
develop (integration branch)
  ↓
feature/your-feature (your work)
```

### Release Process

1. **Feature Development**
   - Branch from `develop`
   - Implement feature
   - Create PR to `develop`

2. **Testing**
   - Automated tests run
   - Manual testing on devices
   - Code review

3. **Merge to Develop**
   - PR approved
   - Merge to `develop`
   - Integration testing

4. **Release**
   - Create release branch
   - Final testing
   - Merge to `main`
   - Tag version
   - Deploy to app stores

### Versioning

We use [Semantic Versioning](https://semver.org/):

```
MAJOR.MINOR.PATCH

1.0.0 → 1.0.1 (patch: bug fix)
1.0.1 → 1.1.0 (minor: new feature)
1.1.0 → 2.0.0 (major: breaking change)
```

## Getting Help

**Stuck? Need help?**
- Check [Documentation](docs/)
- Search [Issues](https://github.com/harikapadia999/even-g2-calendar-companion/issues)
- Ask in [Discussions](https://github.com/harikapadia999/even-g2-calendar-companion/discussions)
- Email: harikapadia99@gmail.com

## Recognition

Contributors are recognized in:
- README.md Contributors section
- Release notes
- GitHub contributors page

Thank you for contributing! 🎉
