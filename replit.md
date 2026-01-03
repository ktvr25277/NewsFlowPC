# Japanese News Ticker Application

## Overview

A Japanese news aggregator that displays headlines from multiple RSS sources (NHK, Google News Japan, Livedoor) in a customizable scrolling ticker format. Users can configure scroll direction, speed, and news sources, and save articles for later reading. The application fetches news from RSS feeds, stores them in PostgreSQL, and presents them through an animated ticker interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript, built using Vite
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state, localStorage for user preferences
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming (light/dark mode support)
- **Animations**: Framer Motion for ticker animations, CSS keyframe animations for seamless looping

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ESM modules
- **API Design**: RESTful endpoints defined in shared route schemas with Zod validation
- **Build System**: esbuild for server bundling, Vite for client bundling

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: `shared/schema.ts` - single source of truth for database types
- **Migrations**: Drizzle Kit with `db:push` command for schema synchronization
- **Client Storage**: localStorage for user settings and "Read Later" bookmarks

### Key Design Patterns
- **Shared Types**: The `shared/` directory contains schema and route definitions used by both client and server
- **Path Aliases**: `@/` maps to client source, `@shared/` maps to shared modules
- **RSS Aggregation**: Server-side RSS parsing with periodic sync to database
- **Upsert Pattern**: News items are deduplicated by link URL on insert

### Application Features
- Configurable news ticker (horizontal/vertical scroll, adjustable speed)
- Multi-source filtering (NHK, Google News Japan, Livedoor)
- "Read Later" bookmarking with localStorage persistence
- Manual and automatic news refresh
- Dark/light theme support

## External Dependencies

### Database
- **PostgreSQL**: Primary data store, connection via `DATABASE_URL` environment variable
- **connect-pg-simple**: Session storage (available but may not be actively used)

### RSS Feeds
- NHK News: `https://www.nhk.or.jp/rss/news/cat0.xml`
- Google News Japan: `https://news.google.com/rss?hl=ja&gl=JP&ceid=JP:ja`
- Livedoor News: `https://news.livedoor.com/topics/rss/top.xml`

### Third-Party Libraries
- **rss-parser**: Server-side RSS feed parsing
- **date-fns**: Date formatting throughout the application
- **Radix UI**: Accessible component primitives for shadcn/ui
- **Framer Motion**: Animation library for ticker effects

### Development Tools
- **Drizzle Kit**: Database migration and schema management
- **Vite plugins**: Replit-specific development tools (error overlay, cartographer, dev banner)