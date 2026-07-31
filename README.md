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

**RealOps** is a full-stack platform built for one of the leading Convoy Control teams in the [TruckersMP](https://truckersmp.com) community. It combines a feature-rich **Discord bot**, an **admin dashboard**, and a **public-facing website** into a single unified system — all backed by **Firebase Firestore** for real-time data synchronisation.

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

## Firestore Collections

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

- 🔐 Discord OAuth2 authentication for dashboard access
- 🛡️ Session-based auth with secure cookie handling
- 👥 Role-based access control with admin-only endpoints
- 🔒 Firebase Admin SDK — server-side only, no client credentials exposed
- ⚡ Rate limiting on API endpoints

---

## License

This project is proprietary software developed for **RealOps Group**. All rights reserved.

---

<p align="center">
  Built with ❤️ for <strong>The RealOps Group</strong>
</p>
