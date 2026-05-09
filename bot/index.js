const { 
    Client, 
    GatewayIntentBits, 
    Partials, 
    REST, 
    Routes,
    Collection,
    SlashCommandBuilder
} = require('discord.js');
const config = require('./config');
const TOKEN = config.BOT_TOKEN;
const CLIENT_ID = config.CLIENT_ID;
const GUILD_ID = config.GUILD_ID;
const { setupTicketSystem } = require('./ticketSystem');
const { setupCustomCommandsListener } = require('./customCommandsHandler');
const { setupCommandConfig } = require('./commandConfig');
const fs = require('fs');
const path = require('path');

// Validate required config
if (!TOKEN || !CLIENT_ID || !GUILD_ID) {
    console.error('Missing BOT_TOKEN, CLIENT_ID, or GUILD_ID in config.js');
    process.exit(1);
}

// Global error handlers — prevent silent crashes
process.on('unhandledRejection', (error) => {
    console.error('⚠️ Unhandled promise rejection:', error);
});
process.on('uncaughtException', (error) => {
    console.error('🔴 Uncaught exception:', error);
});

// Create client instance
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions
    ],
    partials: [Partials.Channel, Partials.Message, Partials.Reaction]
});

// Load all event handlers
const eventsPath = path.join(__dirname, 'events');
fs.readdirSync(eventsPath)
    .filter(file => file.endsWith('.js'))
    .forEach(file => {
        const event = require(path.join(eventsPath, file));
        if (event.name && typeof event.execute === 'function') {
            client.on(event.name, (...args) => event.execute(...args));
        } else {
            console.warn(`[WARNING] Event file ${file} does not export { name, execute }!`);
        }
    });

// Define special panel setup commands
const panelCommands = [
    new SlashCommandBuilder()
        .setName('setup-jointeam')
        .setDescription('Set up the Join Team panel in the current channel'),
    new SlashCommandBuilder()
        .setName('setup-bookus')
        .setDescription('Set up the Book Us panel in the current channel'),
    new SlashCommandBuilder()
        .setName('setup-support')
        .setDescription('Set up the Support panel in the current channel'),
    new SlashCommandBuilder()
        .setName('setup-partnership')
        .setDescription('Set up the Partnership panel in the current channel'),
    new SlashCommandBuilder()
        .setName('setup-founders')
        .setDescription('Set up the Founders Manager panel in the current channel'),
    new SlashCommandBuilder()
        .setName('setup-hr')
        .setDescription('Set up the HR Department panel in the current channel')
];

// Load commands dynamically from the ./commands folder
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

// Add dynamically loaded commands
for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.warn(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

// Function to register commands
async function registerCommands() {
    try {
        console.log('Started refreshing application (/) commands.');
        
        const dynamicCommandsArray = [];
        // Add all static and custom commands currently loaded in client.commands
        for (const [name, command] of client.commands.entries()) {
            if ('data' in command) {
                dynamicCommandsArray.push(command.data.toJSON());
            }
        }
        
        // Add panel setup commands to registration array (these are standalone)
        for (const cmd of panelCommands) {
            dynamicCommandsArray.push(cmd.toJSON());
        }

        const rest = new REST({ version: '10' }).setToken(TOKEN);
        await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
            { body: dynamicCommandsArray }
        );
        console.log(`Successfully reloaded ${dynamicCommandsArray.length} application (/) commands globally.`);
    } catch (error) {
        console.error('Error registering commands:', error);
    }
}

// When bot is ready
client.once('ready', async () => {
    console.log(`✅ Bot logged in as ${client.user.tag}`);

    // Set a Custom Status (shows up in the profile bubble)
    const { ActivityType } = require('discord.js');
    client.user.setActivity({ 
        type: ActivityType.Custom, 
        name: 'customstatus',
        state: 'Join RealOps Group 🎯' 
    });
    
    // Load command overrides from Firebase (for dashboard editing)
    setupCommandConfig();
    
    // Register commands directly once, and setup the Firebase listener to re-register on updates
    await registerCommands();
    setupCustomCommandsListener(client, registerCommands);
    
    setupTicketSystem(client);

    // Start lightweight health check HTTP server
    startHealthServer();
});

// ─── Bot Health Check Server ───
// Allows PM2, monitoring tools, or load balancers to check if the bot is alive
const http = require('http');
const HEALTH_PORT = process.env.BOT_HEALTH_PORT || 3002;

function startHealthServer() {
    const server = http.createServer((req, res) => {
        if (req.url === '/health' && req.method === 'GET') {
            const wsStatus = client.ws?.status;
            const wsStatusName = ['READY', 'CONNECTING', 'RECONNECTING', 'IDLE', 'NEARLY', 'DISCONNECTED', 'WAITING_FOR_GUILDS', 'IDENTIFYING', 'RESUMING'][wsStatus] || 'UNKNOWN';
            const isHealthy = wsStatus === 0; // 0 = READY

            const healthData = {
                status: isHealthy ? 'ok' : 'degraded',
                bot: client.user?.tag || 'Not logged in',
                wsStatus: wsStatusName,
                uptime: client.uptime ? `${Math.floor(client.uptime / 1000 / 60)} minutes` : 'N/A',
                guilds: client.guilds?.cache.size || 0,
                ping: `${client.ws?.ping || 0}ms`,
                memoryUsage: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
                timestamp: new Date().toISOString()
            };

            res.writeHead(isHealthy ? 200 : 503, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(healthData));
        } else {
            res.writeHead(404);
            res.end('Not found');
        }
    });

    server.listen(HEALTH_PORT, () => {
        console.log(`🏥 Bot health check server running on port ${HEALTH_PORT}`);
    });

    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.warn(`⚠️ Health check port ${HEALTH_PORT} already in use, skipping health server`);
        } else {
            console.error('Health server error:', err);
        }
    });
}

// Global error handler
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('Unhandled Rejection:', error);
});

// Graceful shutdown handlers
function shutdown(signal) {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    
    client.destroy();
    console.log('Discord client destroyed');
    
    // Delete PID file if it exists
    const pidFile = path.join(__dirname, 'bot.pid');
    if (fs.existsSync(pidFile)) {
        fs.unlinkSync(pidFile);
        console.log('PID file removed');
    }
    
    process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGHUP', () => shutdown('SIGHUP'));

// Login to Discord
console.log('Attempting to login to Discord...');
client.login(TOKEN).then(() => {
    console.log('Login successful!');
}).catch((error) => {
    console.error('Login failed:', error);
    process.exit(1);
});
