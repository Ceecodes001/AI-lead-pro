# AI Lead Manager Pro - Next.js

A modern, intelligent lead management platform built with Next.js, TypeScript, and Tailwind CSS. This application helps web design agencies manage leads, create campaigns, and leverage AI-powered insights.

## Features

- **Lead Management**: Track and organize potential clients with detailed information
- **Campaign Creation**: Design and schedule email campaigns for lead outreach
- **Analytics Dashboard**: Visual insights into lead conversion funnels and campaign performance
- **AI Assistant**: Powered by Google Gemini AI for:
  - Lead analysis and scoring
  - Email generation and personalization
  - Potential lead discovery
  - Campaign optimization suggestions
- **Firebase Integration**: Real-time data persistence
- **Responsive Design**: Beautiful glass-morphism UI that works on all devices

## Tech Stack

- **Framework**: Next.js 15+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Firebase Realtime Database
- **AI**: Google Gemini AI API
- **Charts**: Recharts
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 20+ installed
- npm or yarn package manager
- (Optional) Google Gemini API key for AI features
- (Optional) Firebase project for data persistence

### Installation

1. Clone the repository:

```bash
git clone https://github.com/Ceecodes001/AI-lead-pro.git
cd AI-lead-pro/al-lead
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Add your Gemini API key (optional):

```env
GEMINI_API_KEY=your_api_key_here
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
al-lead/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── AIAssistant.tsx
│   ├── Analytics.tsx
│   ├── Campaigns.tsx
│   ├── Dashboard.tsx
│   ├── Header.tsx
│   ├── LeadAnalysisModal.tsx
│   ├── Leads.tsx
│   ├── Sidebar.tsx
│   └── icons/
├── hooks/                 # Custom React hooks
│   └── useLocalStorage.ts
├── services/              # External services
│   ├── firebaseService.ts
│   └── geminiService.ts
├── types.ts               # TypeScript type definitions
├── constants.tsx          # App constants
└── package.json

```

## Features in Detail

### Lead Management

- Add, edit, and delete leads
- Track lead status (New, Contacted, Qualified, etc.)
- Store contact information and notes
- AI-powered lead analysis and scoring

### Campaign Management

- Create email campaigns
- Schedule campaigns for future dates
- Track campaign performance
- AI-assisted email generation

### Analytics

- Visual conversion funnel
- Campaign performance metrics
- Lead status distribution
- Trend analysis

### AI Assistant

- Chat interface for insights
- Lead discovery using Google Search
- Email template generation
- Campaign strategy suggestions

## Configuration

### Firebase Setup

Update `services/firebaseService.ts` with your Firebase config:

```typescript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  databaseURL: "your-database-url",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id",
};
```

### Environment Variables

- `GEMINI_API_KEY`: Your Google Gemini AI API key (optional)

## Migration from Vite

This project was migrated from a Vite React application to Next.js. Key changes:

- Added `'use client'` directives to interactive components
- Updated imports to use Next.js `@/` alias
- Configured Next.js app router
- Updated environment variable handling

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is private and proprietary.

## Support

For issues and questions, please open an issue on the GitHub repository.

---

Built with ❤️ using Next.js and AI
