<p align="center">
  <img src="https://i.ibb.co/FMYFdhk/real-ops-group-logo.png" alt="RealOps Logo" width="120" />
</p>

<h1 align="center">RealOps</h1>

<p align="center">
  <strong>Professional Convoy Control Platform for TruckersMP</strong>
</p>

<p align="center">
  <a href="https://realops.cc">Website</a> •
  <a href="https://dashboard.realopsevents.com">Dashboard</a> •
  <a href="https://discord.gg/realops">Discord</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen?style=flat-square&logo=node.js" alt="Node.js" />
  <img src="https://img.shields.io/badge/discord.js-v14-5865F2?style=flat-square&logo=discord&logoColor=white" alt="Discord.js" />
  <img src="https://img.shields.io/badge/react-18-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/firebase-admin-FFCA28?style=flat-square&logo=firebase&logoColor=black" alt="Firebase" />
  <img src="https://img.shields.io/badge/license-proprietary-red?style=flat-square" alt="License" />
</p>

---

## Overview

**RealOps** is a full-stack platform built for one of the leading Convoy Control teams in the [TruckersMP](https://truckersmp.com) community. It combines a feature-rich **Discord bot**, an **admin dashboard**, and a **public-facing website** into a single unified system — all backed by **Firebase** for real-time data synchronisation.

---

## Architecture

```
RealOps/
├── bot/                # Discord bot (discord.js v14)
│   ├── commands/       # 27 slash commands
│   ├── events/         # Guild event handlers
│   ├── panels/         # Interactive embed panels
│   ├── ticketSystem/   # Full ticket lifecycle management
│   └── utils/          # Shared helpers
│
├── dashboard/          # Admin dashboard
│   ├── backend/        # Express + Socket.IO API (port 3001)
│   │   └── routes/     # 18 REST API route modules
│   └── frontend/       # React 18 SPA
│       └── src/pages/  # 15+ dashboard pages
│
├── website/            # Public website (vanilla HTML/CSS/JS SPA)
│   ├── js/pages/       # Client-side page modules
│   └── css/            # Stylesheets
│
├── ecosystem.config.js # PM2 process manager config
├── nginx.conf          # Production Nginx reverse proxy
└── start_all.bat       # Local dev launcher (Windows)
```

---

## Features

### 🤖 Discord Bot

| Category | Highlights |
|---|---|
| **Ticket System** | Multi-category tickets, transcript generation, Firebase-synced state, admin commands, recovery tools |
| **Event Management** | Scenario packs, event announcements, forum creation, reminders, upcoming event auto-posts |
| **Panel System** | Book Us, Join Team, Support, Partnership, HR, Founders — all deployable via slash commands |
| **Staff Tools** | Availability tracking, weekly automated announcements, staff openings |
| **Partnerships** | Terms delivery, acceptance/decline flows, partnership announcements |
| **Roles & Automation** | Reaction roles, notification reactions, auto nickname, role handlers, join accept/decline |
| **Custom Commands** | Firebase-backed custom command system editable from the dashboard in real-time |
| **Health Monitoring** | Built-in HTTP health-check endpoint (`/health`) for PM2 / load balancers |

### 📊 Admin Dashboard

| Page | Description |
|---|---|
| **Dashboard** | Server overview, member stats, real-time metrics |
| **Events** | Create scenario packs, schedule announcements, manage event forums |
| **Tickets** | Live ticket feed, transcript viewer, search, export (PDF/TXT/JSON) |
| **Staff** | View all staff, performance, send DMs, manage roles |
| **Embeds** | Full embed builder with live preview, templates, JSON import/export |
| **Panels** | Visual panel editor, live preview, instant deploy to channels |
| **Announcements** | Multi-channel messaging, scheduled messages |
| **Partnerships** | Track partnerships, send terms, manage announcements |
| **Roles** | Reaction role creator, auto-role rules |
| **Custom Commands** | Create, edit, delete slash commands in real-time |
| **Analytics** | Ticket performance, user engagement graphs, export to Excel/PDF |
| **Recruitment** | Manage recruitment postings |
| **Feedback** | View & respond to community feedback |
| **Settings** | Bot configuration, command overrides |

### 🌐 Public Website

- Modern SPA with client-side routing
- Three.js animated background
- PWA support (service worker + manifest)
- Pages: Home, Events, Team, About, Stats, Recruitment, Contact, Privacy, Guidelines, Legal
- SEO optimised (Open Graph, Twitter Cards, JSON-LD structured data)
- Google Analytics integration

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Bot** | Node.js, discord.js v14, Firebase Admin SDK |
| **Backend API** | Express.js, Socket.IO, Passport (Discord OAuth2), Firebase Admin |
| **Frontend** | React 18, React Router v6, Recharts, react-beautiful-dnd, Axios |
| **Website** | Vanilla HTML/CSS/JS, Three.js, esbuild |
| **Database** | Firebase Firestore (real-time sync) |
| **Process Manager** | PM2 |
| **Reverse Proxy** | Nginx |

---

## Prerequisites

- **Node.js** v16 or higher
- **npm** v8+
- **Discord Bot** application with OAuth2 configured
- **Firebase** project with Firestore enabled
- **PM2** (production) or **multiple terminals** (development)

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Bharat27-d/RealOps.git
cd RealOps
```

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/) → create a new project
2. Enable **Firestore Database**
3. Go to **Project Settings → Service Accounts** → generate a new private key
4. Note your `project_id`, `private_key`, and `client_email`

### 3. Discord Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application (or use existing)
3. Copy your **Bot Token**, **Client ID**, and **Client Secret**
4. Add OAuth2 Redirect URL: `http://localhost:3001/auth/discord/callback`
5. Enable **Privileged Gateway Intents**: Server Members, Message Content

### 4. Environment Configuration

Create `.env` files in the following locations using the templates below:

**`bot/.env`**
```env
BOT_TOKEN=your_bot_token
CLIENT_ID=your_client_id
GUILD_ID=your_guild_id

FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY="your_private_key"
FIREBASE_CLIENT_EMAIL=your_client_email
```

**`dashboard/backend/.env`**
```env
DISCORD_BOT_TOKEN=your_bot_token
DISCORD_CLIENT_ID=your_client_id
DISCORD_CLIENT_SECRET=your_client_secret
DISCORD_GUILD_ID=your_guild_id
DISCORD_CALLBACK_URL=http://localhost:3001/auth/discord/callback

FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY="your_private_key"
FIREBASE_CLIENT_EMAIL=your_client_email

PORT=3001
SESSION_SECRET=generate_a_random_string
FRONTEND_URL=http://localhost:3000
ADMIN_USER_IDS=your_discord_user_id
```

**`dashboard/frontend/.env`**
```env
REACT_APP_API_URL=http://localhost:3001
REACT_APP_DISCORD_CLIENT_ID=your_client_id
```

### 5. Install Dependencies

```bash
# Bot
cd bot && npm install && cd ..

# Dashboard Backend
cd dashboard/backend && npm install && cd ../..

# Dashboard Frontend
cd dashboard/frontend && npm install && cd ../..

# Website (optional — only if you need to build)
cd website && npm install && cd ..
```

### 6. Run Locally

**Option A — Use the launcher script (Windows):**
```powershell
start_all.bat
```

**Option B — Run each service manually:**

```bash
# Terminal 1 — Bot
cd bot && node index.js

# Terminal 2 — Dashboard Backend
cd dashboard/backend && node server.js

# Terminal 3 — Dashboard Frontend
cd dashboard/frontend && npm start

# Terminal 4 — Website (optional)
npx -y serve ./website -l 5500
```

| Service | URL |
|---|---|
| Public Website | http://localhost:5500 |
| Dashboard | http://localhost:3000 |
| Backend API | http://localhost:3001 |
| Bot Health Check | http://localhost:3002/health |

---

## Production Deployment

### PM2

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Nginx

Copy the included `nginx.conf` to `/etc/nginx/sites-available/realops` and configure your domains:

| Domain | Service |
|---|---|
| `realops.cc` | Public website (static files) |
| `dashboard.realops.cc` | Dashboard frontend + API proxy |

Enable SSL with Let's Encrypt — see the commented SSL blocks in `nginx.conf`.

### Frontend Build

```bash
cd dashboard/frontend
npm run build
```

Deploy the `build/` folder to your server or static hosting.

---

## Firestore Collections

The following collections are automatically created and managed:

| Collection | Purpose |
|---|---|
| `tickets` | Ticket system data & transcripts |
| `events` | Event information & schedules |
| `staff` | Staff member data |
| `partnerships` | Partnership tracking |
| `feedback` | Community feedback submissions |
| `panels` | Panel configurations |
| `roles` | Role automation rules |
| `announcements` | Announcement history |
| `embedTemplates` | Saved embed templates |
| `analytics` | Analytics data |
| `scheduledMessages` | Scheduled message queue |
| `staffAvailability` | Staff availability tracking |
| `documentation` | Documentation files |

---

## Security

- 🔐 **Discord OAuth2** authentication for dashboard access
- 🛡️ **Session-based** auth with secure cookie handling
- 👥 **Role-based access control** — admin-only endpoints
- 🔒 **Firebase Admin SDK** — server-side only, no client credentials exposed
- ⚡ **Rate limiting** on API endpoints
- 📁 **`.env` files** excluded from version control

---

## Troubleshooting

<details>
<summary><strong>Bot won't connect</strong></summary>

- Verify `BOT_TOKEN` in `.env`
- Ensure the bot is invited to your server with correct permissions
- Check that all Privileged Gateway Intents are enabled in the Developer Portal
</details>

<details>
<summary><strong>Firebase errors</strong></summary>

- Double-check `FIREBASE_PROJECT_ID`, `FIREBASE_PRIVATE_KEY`, and `FIREBASE_CLIENT_EMAIL`
- Ensure Firestore is enabled (not just Realtime Database)
- Verify service account has Editor permissions
</details>

<details>
<summary><strong>OAuth / Login issues</strong></summary>

- The redirect URL must match **exactly** — `http://localhost:3001/auth/discord/callback`
- Verify `CLIENT_ID` and `CLIENT_SECRET`
- The user must be a member of the configured guild
</details>

<details>
<summary><strong>Dashboard API not reachable</strong></summary>

- Ensure the backend is running on port 3001
- Check `REACT_APP_API_URL` in the frontend `.env`
- Look for CORS errors in the browser console
</details>

---

## License

This project is proprietary software developed for **RealOps Group**. All rights reserved.

---

<p align="center">
  Built with ❤️ for <strong>The RealOps Group</strong>
</p>
