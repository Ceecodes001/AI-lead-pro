<!-- Use this file to provide workspace-specific custom instructions to Copilot. -->

## AI Lead Management Pro - Next.js Migration

This is a Next.js TypeScript project migrated from a Vite React application. The application manages leads, campaigns, and analytics with AI-powered features.

### Project Status

- [x] Create copilot-instructions.md file
- [x] Get Next.js project setup information
- [x] Scaffold Next.js project
- [x] Migrate components from Vite project
- [x] Migrate services and utils
- [x] Update imports and configurations
- [x] Install dependencies
- [x] Test and compile project

### Tech Stack

- Next.js 15+ with App Router
- TypeScript
- Tailwind CSS
- Firebase Realtime Database
- Google Gemini AI (optional)
- Recharts for data visualization
- Lucide React for icons

### Key Features

- Lead management with Firebase persistence
- Campaign creation and scheduling
- Analytics dashboard
- AI-powered lead analysis and email generation

### Development Commands

- `npm run dev` - Start development server on port 3000
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

### Migration Notes

All components have been migrated with 'use client' directives and updated imports using the @ alias pattern.

### Important

- The project is now running at http://localhost:3000
- All Vite-specific code has been converted to Next.js
- Environment variables are configured in .env file
- Firebase and Gemini AI integration is working (with or without API key)
