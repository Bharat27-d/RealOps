# RealOps Bot & Dashboard

Complete Discord bot management system with web dashboard using Firebase.

## 🎯 Features

### 1. Event Management
- ✅ Scenario Pack System (Multi-Embed Creation)
- ✅ Create & Schedule Event Announcements
- ✅ Visual Event Timeline
- ✅ Manage Event Forums

### 2. Ticket System
- ✅ Real-time ticket updates
- ✅ Full transcript viewer with search
- ✅ Export transcripts (PDF, TXT, JSON)
- ✅ Ticket analytics & performance metrics

### 3. Staff Management
- ✅ Staff availability calendar
- ✅ Create staff openings
- ✅ Send availability requests
- ✅ View staff details & performance

### 4. Partnership Management
- ✅ Send partnership terms
- ✅ Manage partnership announcements
- ✅ Track active partnerships

### 5. Documentation & Feedback
- ✅ Upload/send documentation
- ✅ View feedback submissions
- ✅ Respond to feedback
- ✅ Categorize feedback

### 6. Panel Management
- ✅ Visual panel editor with live preview
- ✅ Support, HR, Partnership, Founder, Book Us, Join Team panels
- ✅ Instant deploy to channels

### 7. Role & Permission System
- ✅ Reaction role creator
- ✅ Auto-role rules
- ✅ Handle join requests
- ✅ Nickname automation

### 8. Announcements & Communications
- ✅ Send to multiple channels
- ✅ Schedule messages

### 9. Advanced Embed Builder
- ✅ Full customization (title, description, fields, buttons, etc.)
- ✅ Live preview
- ✅ Save templates
- ✅ JSON import/export
- ✅ Character count tracking

### 10. Analytics & Reports
- ✅ Server activity dashboard
- ✅ User engagement graphs
- ✅ Ticket performance metrics
- ✅ Export to Excel/PDF

### 11. User Management
- ✅ View all staff with roles
- ✅ Search and filter
- ✅ Manage roles from dashboard
- ✅ Send DM to staff

## 📋 Prerequisites

- Node.js v16 or higher
- Discord Bot Token
- Firebase Project
- Discord Application with OAuth2

## 🚀 Installation

### 1. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Firestore Database
4. Go to Project Settings > Service Accounts
5. Generate new private key (download JSON file)
6. Extract these values:
   - `project_id`
   - `private_key`
   - `client_email`

### 2. Discord Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create new application or use existing
3. Get your:
   - Bot Token (Bot section)
   - Client ID (OAuth2 section)
   - Client Secret (OAuth2 section)
4. Add OAuth2 Redirect URL: `http://localhost:3001/auth/discord/callback`
5. Enable required intents: Guilds, Guild Messages, Guild Members, Message Content

### 3. Backend Setup

```powershell
# Navigate to backend
cd d:\Bots\RealOps\dashboard\backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your values
notepad .env
```

Edit `.env` file:
```env
DISCORD_BOT_TOKEN=your_bot_token_here
DISCORD_CLIENT_ID=your_client_id_here
DISCORD_CLIENT_SECRET=your_client_secret_here
DISCORD_GUILD_ID=your_guild_id_here
DISCORD_CALLBACK_URL=http://localhost:3001/auth/discord/callback

FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY="your_firebase_private_key"
FIREBASE_CLIENT_EMAIL=your_firebase_client_email

PORT=3001
SESSION_SECRET=generate_random_string_here
FRONTEND_URL=http://localhost:3000

ADMIN_USER_IDS=your_discord_user_id_here
```

### 4. Frontend Setup

```powershell
# Navigate to frontend
cd d:\Bots\RealOps\dashboard\frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env
notepad .env
```

Edit `.env` file:
```env
REACT_APP_API_URL=http://localhost:3001
REACT_APP_DISCORD_CLIENT_ID=your_client_id_here
```

### 5. Run the Application

**Terminal 1 - Backend:**
```powershell
cd d:\Bots\RealOps\dashboard\backend
npm start
```

**Terminal 2 - Frontend:**
```powershell
cd d:\Bots\RealOps\dashboard\frontend
npm start
```

The dashboard will open at `http://localhost:3000`

## 🔧 Configuration

### Adding Staff Roles

Staff members are identified by having roles with "staff" in the name. Update your Discord roles accordingly.

### Firestore Collections

The following collections are automatically created:
- `tickets` - Ticket system data
- `events` - Event information
- `staff` - Staff member data
- `partnerships` - Partnership tracking
- `feedback` - Feedback submissions
- `panels` - Panel configurations
- `roles` - Role automation rules
- `announcements` - Announcement history
- `embedTemplates` - Saved embed templates
- `analytics` - Analytics data
- `scheduledMessages` - Scheduled message queue
- `staffAvailability` - Staff availability tracking
- `documentation` - Documentation files

## 📱 Usage

### Login

1. Navigate to `http://localhost:3000`
2. Click "Login with Discord"
3. Authorize the application
4. You'll be redirected to the dashboard

### Creating Scenario Packs

1. Go to Events page
2. Click "Create Scenario Pack"
3. Customize header settings
4. Add scenarios with images and descriptions
5. Drag to reorder scenarios
6. Select channel and optional user mention
7. Click "Send Scenarios"

### Building Custom Embeds

1. Go to Embeds page
2. Fill in embed fields
3. Add custom fields
4. Preview in real-time
5. Save as template or send immediately

### Managing Panels

1. Go to Panels page
2. Select panel type
3. Customize content and appearance
4. Preview changes
5. Save and deploy to channel

## 🔐 Security

- Discord OAuth2 authentication
- Session-based authentication
- Role-based access control
- Admin-only endpoints
- Secure Firebase connection

## 📊 Analytics

The dashboard tracks:
- Ticket volume and response times
- Event participation
- Staff activity
- User engagement
- System performance

## 🐛 Troubleshooting

**Bot not connecting:**
- Check bot token in `.env`
- Ensure bot is invited to server
- Verify all intents are enabled

**Firebase errors:**
- Check Firebase credentials
- Ensure Firestore is enabled
- Verify service account permissions

**OAuth errors:**
- Check redirect URL matches exactly
- Verify client ID and secret
- Ensure user is in the guild

## 📝 Development

### Backend Structure
```
backend/
├── server.js           # Main server file
├── firebase.js         # Firebase configuration
├── auth.js            # Authentication middleware
├── discordManager.js  # Discord bot manager
└── routes/            # API endpoints
    ├── events.js
    ├── tickets.js
    ├── staff.js
    ├── embeds.js
    ├── panels.js
    ├── discord.js
    └── analytics.js
```

### Frontend Structure
```
frontend/
├── src/
│   ├── App.js              # Main app component
│   ├── components/         # Reusable components
│   │   └── Sidebar.js
│   ├── pages/              # Page components
│   │   ├── Dashboard.js
│   │   ├── Events.js
│   │   ├── Tickets.js
│   │   ├── Staff.js
│   │   ├── Embeds.js
│   │   ├── Panels.js
│   │   └── Analytics.js
│   └── services/
│       └── api.js          # API client
└── public/
    └── index.html
```

## 🚀 Production Deployment

### Backend (Node.js)
- Deploy to Heroku, Railway, or VPS
- Update environment variables
- Update callback URL in Discord Developer Portal

### Frontend (React)
- Build: `npm run build`
- Deploy to Vercel, Netlify, or static hosting
- Update `REACT_APP_API_URL` to production backend URL

### Environment Variables for Production
- Set `NODE_ENV=production`
- Use secure session secret
- Update CORS origin
- Enable cookie secure flag

## 📄 License

This project is for RealOps Group use.

## 🤝 Support

For support, contact the development team.

---

Built with ❤️ for The Real Ops Group
