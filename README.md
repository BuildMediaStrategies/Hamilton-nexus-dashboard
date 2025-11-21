# Forge - AI-Powered Project Management for Scaffolding Companies

<div align="center">

![Forge Logo](public/icons/icon-192x192.png)

**Intelligent project management built specifically for scaffolding companies**

[![PWA](https://img.shields.io/badge/PWA-enabled-blue)](https://web.dev/progressive-web-apps/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-blue)](https://reactjs.org/)

[Demo](https://forge-demo.vercel.app) · [Documentation](DEPLOYMENT.md) · [Report Bug](https://github.com/yourusername/forge/issues)

</div>

---

## 🚀 Features

### Core Functionality

- **📊 AI-Powered Dashboard**
  - Real-time project insights
  - Intelligent recommendations
  - Overdue alerts and capacity analysis
  - Weekly progress tracking

- **📝 Smart Work Order Management**
  - Create and track work orders
  - Assign crews and set priorities
  - Due date tracking
  - Status monitoring

- **🤖 AI Assistant Chat**
  - Natural language queries
  - Instant answers about jobs and work orders
  - Crew availability insights
  - Contextual help

- **🏗️ Job Tracking**
  - Manage multiple projects
  - Client and site management
  - AI-powered job creation from text
  - Progress monitoring

- **📱 Mobile-First Design**
  - Works on any device
  - Offline capable
  - Touch-optimized interface
  - Native app experience

### Technical Features

- Progressive Web App (PWA) - installable on any device
- Offline-first architecture
- Real-time data sync with Supabase
- Form validation and error handling
- Keyboard shortcuts for power users
- Loading states and skeleton screens
- Toast notifications
- Black/white professional theme

---

## 📱 Progressive Web App Distribution

Forge can be distributed as a native app on iOS and Android app stores using PWA wrapper technologies.

### Quick Start - PWA Builder Method (Recommended)

**For app store distribution without coding:**

1. **Deploy your app** (see [Deployment](#-deployment) section)

2. **Visit [PWABuilder.com](https://www.pwabuilder.com/)**

3. **Enter your deployed URL**
   ```
   https://your-forge-deployment.vercel.app
   ```

4. **Generate Packages**
   - Click "Android" → Generate Package
   - Click "iOS" → Generate Package
   - Download both packages

5. **Sign and Submit**
   - **Android**: Follow included instructions to sign APK/AAB
   - **iOS**: Open in Xcode (Mac required), configure signing, archive and upload

6. **Upload to Stores**
   - **Google Play**: Upload AAB to [Play Console](https://play.google.com/console)
   - **App Store**: Upload via Xcode to [App Store Connect](https://appstoreconnect.apple.com/)

**Detailed Instructions**: See [DEPLOYMENT.md](DEPLOYMENT.md) for complete step-by-step guide.

### Alternative - Capacitor Method

For more control and native integrations:

```bash
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios

npx cap init
npx cap add android
npx cap add ios

npm run build
npx cap sync

npx cap open android  # Opens Android Studio
npx cap open ios      # Opens Xcode (Mac only)
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed Capacitor instructions.

---

## 🛠️ Technology Stack

- **Framework**: React 18.3 with TypeScript 5.5
- **Build Tool**: Vite 5.4
- **UI Library**: shadcn/ui (Radix UI primitives)
- **Styling**: Tailwind CSS 3.4
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Icons**: Lucide React
- **State Management**: React Hooks
- **Form Validation**: Zod + React Hook Form
- **Notifications**: Sonner

---

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Git

---

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/forge.git
cd forge
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get these values from your [Supabase Dashboard](https://supabase.com/dashboard).

### 4. Set Up Database

Run the migration in your Supabase SQL editor:

```bash
cat supabase/migrations/20251028223453_create_scaffoldpm_schema.sql
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 6. Build for Production

```bash
npm run build
```

The production build will be in the `dist` folder.

---

## 📱 Deployment

### Web Hosting

**Vercel (Recommended)**:
```bash
npm install -g vercel
vercel --prod
```

**Netlify**:
```bash
npm install -g netlify-cli
netlify deploy --prod
```

**Firebase**:
```bash
npm install -g firebase-tools
firebase init hosting
firebase deploy
```

### App Store Distribution

See our comprehensive guides:
- [DEPLOYMENT.md](DEPLOYMENT.md) - Complete app store submission guide
- [MOBILE-TESTING.md](MOBILE-TESTING.md) - Pre-submission testing checklist

**Required Assets**:
- App icons: See `/public/icons/README.md`
- Screenshots: See `/public/screenshots/README.md`

---

## 📁 Project Structure

```
forge/
├── public/                 # Static assets
│   ├── icons/             # App icons (all sizes)
│   ├── screenshots/       # App store screenshots
│   ├── splash/            # iOS splash screens
│   ├── manifest.json      # PWA manifest
│   └── sw.js              # Service worker
├── src/
│   ├── components/        # React components
│   │   ├── auth/         # Authentication
│   │   ├── chat/         # AI chat assistant
│   │   ├── dashboard/    # Dashboard & insights
│   │   ├── jobs/         # Job management
│   │   ├── mobile/       # Mobile-specific views
│   │   ├── ui/           # Reusable UI components
│   │   └── workorders/   # Work order management
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilities and helpers
│   │   ├── aiChat.ts    # AI chat logic
│   │   ├── aiInsights.ts # AI insights generation
│   │   ├── storage.ts    # Supabase integration
│   │   └── supabase.ts   # Supabase client
│   ├── types/            # TypeScript types
│   ├── App.tsx           # Main app component
│   └── main.tsx          # App entry point
├── supabase/
│   └── migrations/       # Database migrations
├── DEPLOYMENT.md         # Deployment guide
├── MOBILE-TESTING.md     # Testing checklist
└── README.md             # This file
```

---

## ⚡ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run typecheck` - Check TypeScript types

---

## 🎨 App Store Assets

### App Icons

Generate all required icon sizes (see `/public/icons/README.md`):

- 72×72, 96×96, 128×128, 144×144, 152×152
- 192×192, 384×384, 512×512, 1024×1024

**Design**: Bold "F" letter in minimalist industrial style
- Black "F" on white background (recommended)
- Or white "F" on black background

### Screenshots

Capture screenshots for app stores (see `/public/screenshots/README.md`):

**iOS**: 1242×2688 or 1284×2778 (3-10 screenshots)
**Android**: 1080×1920 or 1080×2340 (2-8 screenshots)

**Suggested Screenshots**:
1. Dashboard with AI insights
2. Work orders list
3. AI chat assistant
4. Job creation flow
5. Mobile responsive view

---

## 🔑 Key Features for Marketing

### AI-Powered Intelligence
- Automatic overdue detection
- Crew capacity optimization
- Progress tracking and forecasting
- Smart recommendations

### Built for Field Teams
- Works offline
- Mobile-optimized
- One-tap actions
- Voice-friendly AI chat

### Enterprise-Ready
- Secure authentication
- Row-level security
- Real-time sync
- Audit logging

### Professional Design
- Clean black/white theme
- Intuitive interface
- Keyboard shortcuts
- Responsive on all devices

---

## 📝 App Store Descriptions

### Short Description (80 characters)
```
AI-powered project management for scaffolding companies
```

### Keywords
```
scaffolding, construction, project management, AI, work orders, field management, crew scheduling
```

### Full Description
See [DEPLOYMENT.md](DEPLOYMENT.md) for complete app store descriptions ready to copy-paste.

---

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Mobile Testing Checklist
Complete the [MOBILE-TESTING.md](MOBILE-TESTING.md) checklist before app store submission.

### PWA Audit
1. Build and deploy your app
2. Open in Chrome
3. DevTools (F12) → Lighthouse
4. Run audit with "Progressive Web App" checked
5. Target score: 90+

---

## 🐛 Known Issues & Roadmap

### Current Version (v1.0.0)

✅ Core Features:
- AI-powered dashboard
- Work order management
- Job tracking
- AI chat assistant
- Offline functionality
- Mobile responsive

### Planned Features (v1.1.0)

- [ ] Photo uploads for work orders
- [ ] PDF export for reports
- [ ] Push notifications
- [ ] Advanced filtering
- [ ] Multi-language support
- [ ] Dark mode option
- [ ] Team collaboration features
- [ ] Calendar view

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🆘 Support

- **Email**: support@buildmediastrategies.com
- **Documentation**: [Link to docs]
- **Issues**: [GitHub Issues](https://github.com/yourusername/forge/issues)
- **Community**: [Link to Discord/Forum]

---

## 👥 Authors

**Build Media Strategies**
- Website: [buildmediastrategies.com](https://buildmediastrategies.com)
- Email: info@buildmediastrategies.com

---

## 🙏 Acknowledgments

- [Supabase](https://supabase.com/) - Backend infrastructure
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Lucide](https://lucide.dev/) - Icons
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [PWABuilder](https://www.pwabuilder.com/) - PWA packaging

---

## 📊 Stats

![GitHub stars](https://img.shields.io/github/stars/yourusername/forge?style=social)
![GitHub forks](https://img.shields.io/github/forks/yourusername/forge?style=social)
![GitHub issues](https://img.shields.io/github/issues/yourusername/forge)

---

<div align="center">

**Built with ❤️ for scaffolding professionals**

[Website](https://forge-app.com) · [Twitter](https://twitter.com/forgeapp) · [LinkedIn](https://linkedin.com/company/forge-app)

</div>
