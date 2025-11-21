# Forge - Deployment & App Store Distribution Guide

This guide walks you through deploying Forge as a Progressive Web App (PWA) and distributing it to the iOS App Store and Google Play Store.

## Prerequisites

- [ ] Node.js 18+ installed
- [ ] Git repository set up
- [ ] Supabase project configured
- [ ] App icons generated (see `/public/icons/README.md`)
- [ ] Screenshots captured (see `/public/screenshots/README.md`)

---

## STEP 1: Deploy to Web Hosting

### Option A: Vercel (Recommended - Free)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   npm run build
   vercel --prod
   ```

4. **Configure Environment Variables**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add your Supabase credentials:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`

5. **Custom Domain (Optional)**
   - Go to Vercel Dashboard → Your Project → Settings → Domains
   - Add your custom domain (e.g., `forge.yourdomain.com`)
   - Follow DNS configuration instructions

### Option B: Netlify

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login and Deploy**
   ```bash
   netlify login
   npm run build
   netlify deploy --prod
   ```

3. **Configure Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Add environment variables in Netlify dashboard

### Option C: Firebase Hosting

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   firebase login
   ```

2. **Initialize Firebase**
   ```bash
   firebase init hosting
   ```

3. **Deploy**
   ```bash
   npm run build
   firebase deploy
   ```

---

## STEP 2: Test PWA Functionality

### Run Lighthouse Audit

1. Open your deployed app in Chrome
2. Open DevTools (F12) → Lighthouse tab
3. Run audit with "Progressive Web App" checked
4. Target score: **90+**

### Common Issues & Fixes

- **Missing manifest**: Ensure `/manifest.json` is accessible
- **Service Worker not registered**: Check console for errors
- **Icons missing**: Verify all icon sizes in `/public/icons/`
- **HTTPS required**: PWAs require HTTPS (automatic on Vercel/Netlify)

### Test Installation

**Android (Chrome)**:
1. Visit your deployed URL
2. Chrome should show "Install App" prompt
3. Click install and verify app opens standalone

**iOS (Safari)**:
1. Visit your deployed URL in Safari
2. Tap Share → Add to Home Screen
3. Verify app opens without Safari UI

### Test Offline Functionality

1. Install app on device
2. Open app
3. Turn off Wi-Fi and mobile data
4. App should still load from cache
5. Turn connection back on and verify sync

---

## STEP 3: Android Distribution

### Method A: PWABuilder (Easiest - No Android Studio Required)

1. **Visit PWABuilder**
   - Go to [pwabuilder.com](https://www.pwabuilder.com/)
   - Enter your deployed URL: `https://your-forge-url.com`
   - Click "Start"

2. **Generate Package**
   - Review app manifest (should auto-detect)
   - Click on "Android" platform
   - Click "Generate Package"
   - Choose "Trusted Web Activity" (recommended)

3. **Download Package**
   - Download the generated Android project
   - Extract the ZIP file

4. **Sign the APK/AAB**
   - Open the extracted folder
   - Follow the `README.md` instructions to sign your app
   - Generate a keystore if you don't have one:
     ```bash
     keytool -genkey -v -keystore forge-release-key.keystore -alias forge -keyalg RSA -keysize 2048 -validity 10000
     ```

5. **Upload to Google Play**
   - Go to [Google Play Console](https://play.google.com/console)
   - Create a new app or select existing
   - Upload the signed AAB file
   - Fill in store listing details (see App Store Assets section below)
   - Submit for review

### Method B: Capacitor (More Control)

1. **Install Capacitor**
   ```bash
   npm install @capacitor/core @capacitor/cli @capacitor/android
   ```

2. **Initialize Capacitor**
   ```bash
   npx cap init
   ```
   - App name: `Forge`
   - App ID: `com.buildmediastrategies.forge`

3. **Build Web Assets**
   ```bash
   npm run build
   ```

4. **Add Android Platform**
   ```bash
   npx cap add android
   npx cap sync
   ```

5. **Open Android Studio**
   ```bash
   npx cap open android
   ```

6. **Configure in Android Studio**
   - Update `app/build.gradle` with correct version codes
   - Configure signing keys
   - Build → Generate Signed Bundle/APK
   - Choose "Android App Bundle"
   - Follow prompts to sign

7. **Test on Device**
   ```bash
   npx cap run android
   ```

8. **Generate Release Bundle**
   - In Android Studio: Build → Generate Signed Bundle
   - Upload AAB to Google Play Console

---

## STEP 4: iOS Distribution

### Method A: PWABuilder

1. **Generate iOS Package**
   - Go to [pwabuilder.com](https://www.pwabuilder.com/)
   - Enter your URL
   - Click on "iOS" platform
   - Download the generated Xcode project

2. **Open in Xcode (Mac Required)**
   - Extract the ZIP file
   - Double-click `.xcodeproj` file
   - Xcode will open automatically

3. **Configure Signing**
   - Select project in navigator
   - Go to "Signing & Capabilities"
   - Select your Apple Developer team
   - Xcode will auto-generate provisioning profile

4. **Archive and Upload**
   - Product → Archive
   - Once archive completes, click "Distribute App"
   - Choose "App Store Connect"
   - Follow prompts to upload

### Method B: Capacitor

1. **Add iOS Platform**
   ```bash
   npx cap add ios
   npx cap sync
   ```

2. **Open Xcode (Mac Required)**
   ```bash
   npx cap open ios
   ```

3. **Configure Project**
   - Select project in navigator
   - Update Bundle Identifier: `com.buildmediastrategies.forge`
   - Configure Signing with your Apple Developer account
   - Update Info.plist with required permissions

4. **Test on Simulator**
   - Select simulator from device menu
   - Click Run (⌘R)

5. **Archive for App Store**
   - Select "Any iOS Device" from device menu
   - Product → Archive
   - Upload to App Store Connect

6. **Submit for Review**
   - Go to [App Store Connect](https://appstoreconnect.apple.com/)
   - Select your app
   - Add build to version
   - Fill in store listing
   - Submit for review

---

## STEP 5: App Store Assets

### Google Play Store Requirements

**App Icon**:
- Size: 512×512 PNG (32-bit with alpha)
- Design: Black "F" on white background or white "F" on black
- Location: `/public/icons/icon-512x512.png`

**Feature Graphic**:
- Size: 1024×500 JPG or PNG
- Design: Forge branding with black/white theme
- Include app name and key features

**Screenshots** (2-8 required):
- Phone: 1080×1920 or 1080×2340
- Showcase: Dashboard, Work Orders, AI Chat, Job Creation
- Locations: `/public/screenshots/`

**Short Description** (Max 80 characters):
```
AI-powered project management for scaffolding companies
```

**Full Description** (Max 4000 characters):
```
Forge - AI-Powered Project Management for Scaffolding Companies

Transform how your scaffolding company manages projects with Forge, the intelligent project management solution built specifically for field teams.

✨ KEY FEATURES

AI-Powered Insights
• Get intelligent recommendations based on your project data
• Identify overdue work orders automatically
• Optimize crew assignments with capacity analysis
• Real-time project health monitoring

Smart Work Order Management
• Create and track work orders effortlessly
• Assign crews with one tap
• Set priorities and due dates
• Monitor progress in real-time

AI Assistant Chat
• Ask questions in plain English
• "What's overdue?" - Get instant answers
• "Which crews are available?" - AI knows
• Natural language job creation

Job Tracking
• Manage multiple scaffolding projects
• Track from planning to completion
• Client and site address management
• Progress monitoring with AI insights

Field-Ready Mobile Experience
• Works offline - no internet required
• Install as native app on any device
• Fast, responsive interface
• Touch-optimized for field use

🏗️ BUILT FOR SCAFFOLDING PROFESSIONALS

Forge understands the unique needs of scaffolding companies:
- Manage complex multi-site projects
- Coordinate field crews efficiently
- Track equipment and resources
- Generate reports and insights
- Stay compliant with safety requirements

📱 WORKS EVERYWHERE

• iOS and Android devices
• Tablets for office use
• Desktop for detailed planning
• Offline mode for job sites without internet

🔒 SECURE & RELIABLE

• Enterprise-grade security
• Automatic backups
• Data encryption
• GDPR compliant

🚀 GET STARTED IN MINUTES

1. Sign up with your email
2. Create your first job
3. Add work orders
4. Let AI help optimize your operations

Perfect for:
- Scaffolding contractors
- Construction project managers
- Field supervisors
- Safety coordinators
- Operations managers

Download Forge today and experience the future of scaffolding project management!
```

**Categorization**:
- Primary: Business
- Secondary: Productivity

**Content Rating**: Everyone

### iOS App Store Requirements

**App Icon**:
- Size: 1024×1024 PNG (no alpha channel)
- Design: Clean black and white design
- Location: `/public/icons/icon-1024x1024.png`

**Screenshots** (3-10 required per device):
- 6.5" iPhone (14 Pro Max, 13 Pro Max, 12 Pro Max): 1284×2778 or 1242×2688
- 5.5" iPhone (8 Plus): 1242×2208

**App Preview Video** (Optional but recommended):
- 30 seconds max
- Show key features: Dashboard, AI Chat, Work Orders
- Portrait orientation

**Description** (Max 4000 characters):
Use same description as Google Play above

**Keywords** (Max 100 characters):
```
scaffolding,construction,project management,AI,work orders,field,crew,scheduling
```

**Promotional Text** (Max 170 characters):
```
AI-powered project management for scaffolding companies. Track jobs, manage crews, and get intelligent insights - all offline-capable.
```

**Privacy Policy URL**:
Required - host at `https://your-domain.com/privacy-policy`

**Support URL**:
Required - provide support email or website

---

## STEP 6: Beta Testing

### iOS TestFlight

1. **Upload Build to App Store Connect**
   - Follow iOS distribution steps above
   - Don't submit for review yet

2. **Enable TestFlight**
   - Go to App Store Connect → TestFlight tab
   - Select your build
   - Add internal testers (up to 100)

3. **External Testing** (Optional):
   - Submit build for Beta App Review
   - Once approved, create external test group
   - Add up to 10,000 external testers

4. **Invite Testers**
   - Add tester emails
   - Testers receive email with TestFlight install link
   - They can provide feedback directly in TestFlight app

### Android Internal Testing

1. **Upload to Google Play Console**
   - Go to "Internal testing" track
   - Upload your AAB file

2. **Create Test Group**
   - Add tester email addresses
   - Or create email list in Google Groups

3. **Share Test Link**
   - Google Play generates opt-in URL
   - Share with testers
   - They can install via Play Store

4. **Collect Feedback**
   - Review crash reports
   - Check ratings and reviews
   - Iterate based on feedback

### Recommended Beta Test Plan

1. **Week 1-2**: Internal team testing (5-10 people)
2. **Week 3-4**: Partner scaffolding company testing (10-20 users)
3. **Week 5**: Fix critical bugs, polish UI
4. **Week 6**: Final testing, prepare for launch
5. **Week 7**: Submit for public release

---

## STEP 7: App Store Submission Checklist

### Before Submission

- [ ] All app icons generated and in place
- [ ] Screenshots captured for all required device sizes
- [ ] App description written and reviewed
- [ ] Privacy policy created and hosted
- [ ] Support URL configured
- [ ] App tested on real devices (iOS and Android)
- [ ] Offline functionality verified
- [ ] Push notifications tested (if enabled)
- [ ] In-app purchases configured (if applicable)
- [ ] Age rating determined
- [ ] Contact information for app stores added

### Google Play Submission

- [ ] Signed AAB uploaded
- [ ] Store listing complete (title, description, graphics)
- [ ] Content rating questionnaire completed
- [ ] Pricing set (free or paid)
- [ ] Target audience and content set
- [ ] Release notes written
- [ ] Countries/regions selected for distribution

### iOS App Store Submission

- [ ] Build uploaded to App Store Connect
- [ ] Version information filled
- [ ] Build selected for release
- [ ] App Store description complete
- [ ] Keywords optimized
- [ ] Support and marketing URLs provided
- [ ] App Review information provided
- [ ] Export compliance information confirmed
- [ ] Release type selected (manual or automatic)

---

## Post-Launch

### Monitor App Performance

- Check crash reports daily
- Respond to user reviews within 24 hours
- Monitor app store ratings
- Track download metrics

### Updates

- Release updates every 2-4 weeks
- Include new features based on user feedback
- Fix bugs promptly
- Improve performance continuously

### Marketing

- Share on social media
- Reach out to scaffolding industry publications
- Create demo videos
- Offer free trial period
- Attend construction trade shows

---

## Troubleshooting

### Common Issues

**PWA not installing on iOS**:
- Ensure HTTPS is enabled
- Verify manifest.json is accessible
- Check iOS Safari compatibility

**Android app rejected**:
- Review Google Play policies
- Ensure all required permissions explained
- Add privacy policy link

**iOS app rejected**:
- Review App Store guidelines
- Test all functionality thoroughly
- Provide clear App Review notes

**Offline mode not working**:
- Verify service worker registration
- Check cache strategy
- Test with DevTools Network throttling

### Getting Help

- Check [PWABuilder documentation](https://docs.pwabuilder.com/)
- Review [Capacitor docs](https://capacitorjs.com/docs)
- Google Play Console support
- Apple Developer support
- Forge community forum (coming soon)

---

## Version History

- v1.0.0 - Initial release
- Update this file with each major release

---

## Support

For deployment support:
- Email: support@buildmediastrategies.com
- Documentation: [Link to docs]
- Community: [Link to forum/Discord]

---

**Congratulations on launching Forge! 🎉**

Monitor your app's performance, gather user feedback, and continue improving. Your scaffolding company users will love the AI-powered efficiency!
