# Forge Philippines - Promo Campaign Platform

A real-time promotional campaign management platform featuring influencer tracking, product code management, and live ranking dashboards.

## Features

- 🏆 **Real-time Ranking Dashboard** - Track influencer performance with live updates
- 👥 **Influencer Management** - Manage influencer profiles and assignments
- 🎫 **Product Code Management** - Generate and track promotional codes
- 📊 **Analytics Dashboard** - Monitor campaign performance metrics
- 🔐 **Admin Authentication** - Secure access control for administrators

## Getting Started

### Prerequisites

- Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

### Installation

```sh
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory
cd "Promo Campaign"

# Step 3: Install dependencies
npm install

# Step 4: Start the development server
npm run dev
```

### Environment Setup

Create a `.env` file in the root directory with your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Technologies

This project is built with:

- **Vite** - Fast build tool and development server
- **TypeScript** - Type-safe JavaScript
- **React** - UI framework
- **shadcn-ui** - Component library
- **Tailwind CSS** - Utility-first CSS framework
- **Supabase** - Backend and real-time database

## Project Structure

```
src/
├── components/
│   ├── admin/           # Admin dashboard components
│   │   ├── InfluencerManagement.tsx
│   │   ├── ProductCodeManagement.tsx
│   │   └── RankingDashboard.tsx
│   ├── ui/              # Reusable UI components
│   └── RealtimeIndicator.tsx
├── pages/               # Page components
│   ├── Admin.tsx
│   ├── Auth.tsx
│   └── Index.tsx
├── lib/                 # Utilities and configurations
│   ├── supabase.ts
│   └── utils.ts
└── types/               # TypeScript type definitions
    └── database.ts
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Deployment

Build the project for production:

```sh
npm run build
```

The `dist` folder will contain the production-ready files that can be deployed to any static hosting service.

## License

© 2025 Forge Philippines. All rights reserved.
