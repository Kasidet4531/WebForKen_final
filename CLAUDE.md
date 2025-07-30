# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is "WebForKEn_V4" - a Next.js 15 mobile-first WebSocket control interface application designed for remote robot/vehicle control. The app provides a touchscreen controller with joystick controls, route planning, real-time configuration management through WebSocket connections, and administrative user tracking capabilities.

## Key Commands

### Development
- `npm run dev` - Start development server (Next.js dev mode)
- `npm run build` - Build production application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint (currently configured to ignore during builds)

### Package Management
The project uses multiple package managers - prefer `npm` as indicated by `package-lock.json`, though `pnpm-lock.yaml` also exists.

## Architecture Overview

### Core Technologies
- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: Zustand with persistence
- **UI Components**: Radix UI primitives via shadcn/ui
- **Theme**: next-themes for dark/light mode
- **WebSocket**: Native WebSocket for real-time communication
- **Notifications**: Sonner for toast notifications

### Project Structure
- `app/` - Next.js App Router pages and layouts
  - `admin/` - Administrative dashboard page
  - `api/` - API routes for admin auth and user tracking
  - `config/` - Configuration page
  - `manual/` - Manual control interface
  - `route/` - Route planning interface
- `components/` - Reusable React components
  - `ui/` - shadcn/ui components library (comprehensive shadcn/ui implementation)
  - Custom components: joystick, navigation, route modal, theme controls
- `lib/` - Utilities and global state (Zustand store)
- `hooks/` - Custom React hooks including user tracking
- `public/` - Static assets including logos (kenlogo.png, autologo.png)

### State Management (lib/store.ts)
Central Zustand store managing:
- **WebSocket connection**: IP address, connection status, WebSocket instance
- **Route planning**: Array of route steps (left, right, straight, u-turn, pick, drop)
- **Configuration**: Sensor, stop, turn, and referent line width parameters (both persisted config and current runtime config)
- **UI state**: Route expansion, UI visibility, joystick gap settings
- **Admin functionality**: Admin login status, connected users tracking with IP, user agent, and activity timestamps

Persistence is configured for `wsIp`, `config`, and `stickGap` using localStorage. Admin and connection state is session-only.

### Key Components
- **TopNavigation/BottomNavigation**: App layout with mobile-first navigation
- **Joystick**: Touch-based control interface for vehicle movement
- **RouteModal**: Interface for planning and managing movement sequences
- **ThemeProvider**: System/manual theme switching

### Configuration Notes
- ESLint and TypeScript errors are ignored during builds (rapid prototyping setup)
- Images are unoptimized in Next.js config
- Uses `@/*` path aliasing for clean imports
- shadcn/ui configured with neutral base color and CSS variables
- Development origins allowlist configured for local network access (192.168.x.x, 10.0.0.x ranges)
- Admin authentication via environment variables (`ADMIN_USERNAME`, `ADMIN_PASSWORD`)

### WebSocket Integration
The application connects to external hardware/robots via WebSocket for:
- Real-time joystick control commands
- Route execution
- Configuration parameter updates
- Connection status monitoring

## Development Notes

### Mobile-First Design
The interface is specifically designed for touch devices with:
- Large touch targets for joystick controls
- Bottom navigation for thumb-friendly access
- Responsive layout optimized for mobile screens

### Component Library
Uses shadcn/ui for consistent, accessible components. New UI components should follow the established shadcn/ui patterns in `components/ui/`.

### State Persistence
Critical user settings (WebSocket IP, configuration values, UI preferences) persist across sessions via localStorage. Temporary state (connection status, route steps, admin session) resets on page reload.

### API Routes
- `/api/admin/login` - POST endpoint for admin authentication using environment credentials
- `/api/user/track` - POST endpoint for user IP tracking, extracts real IP from headers

### Admin Features
The application includes administrative functionality for monitoring connected users, accessible via `/admin` route after authentication. Admin credentials must be configured via environment variables.