# RealOps Discord Bot

The Discord bot for RealOps event management and support system.

## Structure

```
bot/
├── index.js              # Main bot entry point
├── config.js             # Bot configuration
├── ticketSystem.js       # Ticket system handler
├── commands/             # Slash commands
├── events/               # Discord event handlers
├── panels/               # Panel setup modules
└── utils/                # Utility functions
```

## Setup

1. Install dependencies:
```bash
cd bot
npm install
```

2. Configure environment:
```bash
cp .env.example .env
# Edit .env with your bot credentials
```

3. Start the bot:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## Features

- **Ticket System**: Multi-panel ticket management (Support, HR, Partnership, etc.)
- **Event Management**: Real Ops scenario commands
- **Role Management**: Automated role assignments and reaction roles
- **Staff Tools**: Availability tracking, openings management
- **Partnership System**: Partnership application and management
- **Welcome System**: Automated welcome messages and role assignments

## Commands

All commands are slash commands. Use `/` in Discord to see available commands.

### Main Commands
- `/realopsscenarios` - Send Real Ops scenario packs
- `/setup-support` - Setup support ticket panel
- `/setup-partnership` - Setup partnership panel
- `/setup-jointeam` - Setup join team panel
- `/setup-bookus` - Setup booking panel
- `/setup-hr` - Setup HR panel
- `/setup-founders` - Setup founders panel

## Integration with Dashboard

The bot works alongside the web dashboard (`/dashboard` folder). The dashboard can:
- Send embeds through the bot
- Manage tickets and staff
- Create and schedule announcements
- Build scenario packs
- Manage partnerships

## Configuration

Edit `config.js` to customize:
- Staff role IDs
- Ticket category IDs
- Channel IDs for logging
- Emoji configurations
- Role mappings

## Support

For issues or questions, contact the RealOps development team.
