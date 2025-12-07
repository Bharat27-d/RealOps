# Quick Start Guide - RealOps Dashboard

## 🚀 Quick Setup (5 minutes)

### Step 1: Get Your Credentials

#### Discord Bot
1. Go to https://discord.com/developers/applications
2. Select your bot application
3. Copy these values:
   - **Bot Token**: Bot tab → Reset Token → Copy
   - **Client ID**: OAuth2 tab → Client ID
   - **Client Secret**: OAuth2 tab → Client Secret
4. Add redirect URL: `http://localhost:3001/auth/discord/callback`
5. Enable intents: Server Members, Message Content

#### Firebase
1. Go to https://console.firebase.google.com/
2. Select/Create project
3. Enable Firestore Database (Start in production mode)
4. Go to Project Settings → Service Accounts
5. Click "Generate new private key"
6. Open the downloaded JSON file and copy:
   - `project_id`
   - `private_key`
   - `client_email`

#### Discord Server
1. Right-click your server icon → Copy ID (enable Developer Mode in Discord settings)
2. Right-click your username → Copy ID (this is your admin user ID)

### Step 2: Run Setup

Open PowerShell in the dashboard folder:

```powershell
cd d:\Bots\RealOps\dashboard
.\setup.ps1
```

### Step 3: Configure Environment

#### Backend (.env)
```powershell
cd backend
notepad .env
```

Paste and update:
```env
DISCORD_BOT_TOKEN=YOUR_BOT_TOKEN_HERE
DISCORD_CLIENT_ID=YOUR_CLIENT_ID_HERE
DISCORD_CLIENT_SECRET=YOUR_CLIENT_SECRET_HERE
DISCORD_GUILD_ID=YOUR_SERVER_ID_HERE
DISCORD_CALLBACK_URL=http://localhost:3001/auth/discord/callback

FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

PORT=3001
SESSION_SECRET=random_string_min_32_characters_here
FRONTEND_URL=http://localhost:3000

ADMIN_USER_IDS=YOUR_DISCORD_USER_ID
```

#### Frontend (.env)
```powershell
cd ..\frontend
notepad .env
```

Paste and update:
```env
REACT_APP_API_URL=http://localhost:3001
REACT_APP_DISCORD_CLIENT_ID=YOUR_CLIENT_ID_HERE
```

### Step 4: Start the Dashboard

**Terminal 1 (Backend):**
```powershell
cd d:\Bots\RealOps\dashboard\backend
npm start
```

Wait for: `🚀 Server running on port 3001`

**Terminal 2 (Frontend):**
```powershell
cd d:\Bots\RealOps\dashboard\frontend
npm start
```

Browser will open automatically at `http://localhost:3000`

### Step 5: Login

1. Click "Login with Discord"
2. Authorize the application
3. You're in! 🎉

## 📋 Feature Checklist

After logging in, try these features:

- [ ] **Dashboard**: View server statistics
- [ ] **Events**: Create a scenario pack
- [ ] **Tickets**: View ticket list and analytics
- [ ] **Staff**: See staff members
- [ ] **Embeds**: Build a custom embed with live preview
- [ ] **Panels**: Create and preview a panel
- [ ] **Analytics**: View graphs and export reports

## 🐛 Common Issues

### "Not authenticated" error
- Check if bot is in your server
- Verify DISCORD_GUILD_ID is correct
- Make sure you're a member of the server

### Firebase errors
- Verify FIREBASE_PRIVATE_KEY includes `\n` for newlines
- Check project_id matches your Firebase project
- Ensure Firestore is enabled

### Bot not connecting
- Verify DISCORD_BOT_TOKEN is correct
- Check all intents are enabled
- Look for errors in backend terminal

### CORS errors
- Ensure FRONTEND_URL in backend .env matches your frontend URL
- Check both servers are running

## 💡 Pro Tips

1. **Generate Session Secret**: Use online generator for SESSION_SECRET (32+ characters)
2. **Test Firebase**: Create a test document in Firestore to verify connection
3. **Staff Roles**: Add "staff" to role names to make users appear in staff list
4. **Backup**: Export Firestore data regularly

## 📞 Support

If you encounter issues:
1. Check both terminal windows for error messages
2. Verify all .env values are correct
3. Ensure Firebase and Discord credentials are valid
4. Check README.md for detailed troubleshooting

## 🎯 What's Next?

- Invite more staff to test the dashboard
- Create your first scenario pack
- Build custom embeds for announcements
- Set up panels for your server
- Explore analytics and reports

---

**Ready to go?** Start with Step 1 above! 🚀
