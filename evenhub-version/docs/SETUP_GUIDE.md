# Complete Setup Guide - Calendar Companion (Even Hub SDK)

**Step-by-step instructions to get Calendar Companion running on your Even G2 glasses**

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Google Cloud Console Setup](#google-cloud-console-setup)
3. [Project Setup](#project-setup)
4. [Development Testing](#development-testing)
5. [Even Hub Deployment](#even-hub-deployment)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Hardware

- ✅ Even Realities G2 smart glasses
- ✅ Smartphone (iOS or Android)
- ✅ Computer for development

### Software

- ✅ Even Hub app installed on phone
- ✅ Node.js 20+ installed on computer
- ✅ Git installed
- ✅ Code editor (VS Code recommended)

### Accounts

- ✅ Google account with Calendar access
- ✅ Google Cloud Console account (free tier is fine)
- ✅ GitHub account (optional, for cloning)

---

## Google Cloud Console Setup

### Step 1: Create Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click **Select a project** → **New Project**
3. Enter project name: `even-g2-calendar`
4. Click **Create**
5. Wait for project creation (takes ~30 seconds)

### Step 2: Enable Calendar API

1. In the project dashboard, click **APIs & Services** → **Library**
2. Search for "Google Calendar API"
3. Click on **Google Calendar API**
4. Click **Enable**
5. Wait for API to be enabled

### Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Select **External** user type
3. Click **Create**
4. Fill in required fields:
   - **App name:** `Calendar Companion`
   - **User support email:** Your email
   - **Developer contact:** Your email
5. Click **Save and Continue**
6. **Scopes:** Click **Add or Remove Scopes**
   - Search for `calendar.readonly`
   - Select `.../auth/calendar.readonly`
   - Select `.../auth/calendar.events.readonly`
   - Click **Update**
7. Click **Save and Continue**
8. **Test users:** Add your Google account email
9. Click **Save and Continue**
10. Review and click **Back to Dashboard**

### Step 4: Create OAuth 2.0 Client ID

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Select **Application type:** Web application
4. **Name:** `Calendar Companion Web Client`
5. **Authorized JavaScript origins:**
   - Click **Add URI**
   - Add: `http://localhost:3000`
   - Add: `http://localhost:5173` (Vite default)
   - Add your production domain (if deploying)
6. **Authorized redirect URIs:** (Leave empty for now)
7. Click **Create**
8. **Copy the Client ID** - you'll need this!
9. Click **OK**

### Step 5: Create API Key

1. Still in **Credentials**, click **Create Credentials** → **API key**
2. **Copy the API Key** - you'll need this!
3. Click **Restrict Key** (recommended)
4. **API restrictions:**
   - Select **Restrict key**
   - Check **Google Calendar API**
5. Click **Save**

### Step 6: Publish OAuth Consent (Optional)

For production use:

1. Go to **OAuth consent screen**
2. Click **Publish App**
3. Confirm publishing

For testing, you can skip this and use test users.

---

## Project Setup

### Step 1: Clone Repository

```bash
# Clone the repo
git clone https://github.com/harikapadia999/even-g2-calendar-companion.git

# Navigate to Even Hub version
cd even-g2-calendar-companion/evenhub-version
```

### Step 2: Install Dependencies

```bash
# Install all dependencies
npm install

# This will install:
# - @evenrealities/even_hub_sdk
# - TypeScript
# - Vite
# - date-fns
# - And dev dependencies
```

### Step 3: Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Open .env in your editor
nano .env  # or code .env, vim .env, etc.
```

Edit `.env` with your credentials:

```bash
# Paste your Client ID from Step 4
VITE_GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com

# Paste your API Key from Step 5
VITE_GOOGLE_API_KEY=AIzaSyABCDEFGHIJKLMNOPQRSTUVWXYZ
```

Save and close the file.

### Step 4: Verify Setup

```bash
# Check TypeScript compilation
npm run type-check

# Should output: "No errors found"
```

---

## Development Testing

### Option 1: Browser Testing (Quick)

```bash
# Start development server
npm run dev

# Output will show:
# VITE v7.1.3  ready in 234 ms
# ➜  Local:   http://localhost:3000/
# ➜  Network: use --host to expose
```

1. Open browser to `http://localhost:3000`
2. You'll see the instruction page
3. Open browser console (F12)
4. Check for initialization logs

**Note:** This won't connect to G2 glasses, but you can test:
- Google Calendar authentication
- Event fetching
- Display formatting
- State management

### Option 2: Even Hub Simulator (Recommended)

```bash
# Install Even Hub Simulator globally
npm install -g @evenrealities/evenhub-simulator

# Run simulator
evenhub-simulator

# In another terminal, start your app
npm run dev
```

The simulator provides:
- Virtual G2 display
- R1 ring simulation
- Touchpad simulation
- Event testing
- Debug tools

### Testing Checklist

- [ ] App loads without errors
- [ ] Google sign-in works
- [ ] Calendar events fetch successfully
- [ ] Next event displays correctly
- [ ] Menu navigation works
- [ ] Settings can be changed
- [ ] Auto-sync works (wait 30 seconds)
- [ ] Error handling works (disconnect internet)

---

## Even Hub Deployment

### Step 1: Build Production Version

```bash
# Create optimized production build
npm run build

# Output will be in dist/ folder
# Check build size and warnings
```

### Step 2: Test Production Build

```bash
# Preview production build locally
npm run preview

# Open http://localhost:4173
# Test thoroughly before deploying
```

### Step 3: Deploy to Even Hub

```bash
# Install Even Hub CLI
npm install -g @evenrealities/evenhub-cli

# Login to Even Hub
evenhub-cli login

# Deploy your app
evenhub-cli deploy

# Follow prompts:
# - App name: Calendar Companion
# - Description: Next event display for G2
# - Build folder: dist
```

### Step 4: Install on Phone

1. Open Even Hub app on your phone
2. Go to **App Store** or **My Apps**
3. Find **Calendar Companion**
4. Click **Install**
5. Grant calendar permissions when prompted

### Step 5: Test on G2 Glasses

1. Put on your G2 glasses
2. Open Calendar Companion in Even Hub
3. Sign in to Google Calendar
4. Wait for first sync
5. Test all controls:
   - Scroll down → Menu opens
   - Tap → Refresh
   - Double-tap → Menu/Back
   - Navigate menu with scroll

---

## Troubleshooting

### Build Errors

**Error:** `Cannot find module '@evenrealities/even_hub_sdk'`

**Solution:**
```bash
npm install @evenrealities/even_hub_sdk
```

**Error:** `TypeScript compilation failed`

**Solution:**
```bash
# Check for type errors
npm run type-check

# Fix reported errors
# Common issues:
# - Missing type definitions
# - Incorrect imports
# - Type mismatches
```

### Google Calendar Issues

**Error:** `Failed to initialize Google Calendar API`

**Solution:**
1. Verify API is enabled in Cloud Console
2. Check API key is correct in `.env`
3. Ensure authorized JavaScript origins include your domain
4. Try clearing browser cache

**Error:** `Sign-in popup blocked`

**Solution:**
1. Allow popups for localhost
2. Try signing in from browser settings
3. Check OAuth consent screen configuration

**Error:** `Access denied`

**Solution:**
1. Add your email to test users in OAuth consent screen
2. Verify scopes include calendar.readonly
3. Try revoking and re-granting permissions

### Even Hub Issues

**Error:** `Even Hub SDK not available`

**Solution:**
- This is normal when testing in browser
- Use Even Hub Simulator for testing
- Only works inside actual Even Hub app

**Error:** `App not appearing in Even Hub`

**Solution:**
1. Check deployment was successful
2. Verify app is published
3. Try refreshing app list
4. Check Even Hub app version

### Display Issues

**Problem:** Text cut off

**Solution:**
```typescript
// Adjust in settings or code
maxTitleLength: 30  // Reduce from 40
```

**Problem:** Events not showing

**Solution:**
1. Check you have upcoming events in Google Calendar
2. Verify calendar permissions
3. Check sync status in debug mode
4. Try manual refresh

### Performance Issues

**Problem:** App slow or laggy

**Solution:**
1. Reduce sync interval:
   ```typescript
   syncInterval: 60000  // 60 seconds instead of 30
   ```
2. Limit number of events fetched:
   ```typescript
   maxResults: 5  // Instead of 10
   ```
3. Disable debug mode
4. Check network connection

---

## Advanced Configuration

### Custom Sync Interval

Edit `src/types/calendar.types.ts`:

```typescript
export const DEFAULT_CALENDAR_SETTINGS: CalendarSettings = {
  syncInterval: 60000,  // Change to 60 seconds
  // ... other settings
};
```

### Custom Display Layout

Edit `src/types/display.types.ts`:

```typescript
export const CALENDAR_LAYOUT: CalendarDisplayLayout = {
  title: {
    x: 10,
    y: 30,
    width: 356,
    height: 60,  // Increase title height
  },
  // ... adjust other regions
};
```

### Multiple Calendars

Currently supports primary calendar only. To add multiple calendars:

1. Modify `calendar-service.ts` to fetch from multiple calendar IDs
2. Update state to handle multiple calendar sources
3. Add calendar selection in settings menu

---

## Next Steps

After successful setup:

1. **Customize** - Adjust settings to your preferences
2. **Test** - Use for a few days, note any issues
3. **Feedback** - Report bugs or suggest features
4. **Contribute** - Submit improvements via PR
5. **Share** - Help others in the community

---

## Support

Need help?

- **GitHub Issues:** [Report bugs](https://github.com/harikapadia999/even-g2-calendar-companion/issues)
- **Discussions:** [Ask questions](https://github.com/harikapadia999/even-g2-calendar-companion/discussions)
- **Email:** harikapadia99@gmail.com
- **Discord:** Even Realities community

---

**Happy coding! 🎉**

*Now go enjoy your calendar events on your G2 glasses!*
