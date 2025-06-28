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
const { setupTicketSystem } = require('./ticketSystem');
const fs = require('fs');
const path = require('path');

// Create client instance
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent
    ],
    partials: [Partials.Channel, Partials.Message, Partials.Reaction]
});

// Load all event handlers (including interaction.js)
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

// Load all panel modules
const panelModules = {};
fs.readdirSync(path.join(__dirname, 'panels'))
  .filter(file => file.endsWith('.js'))
  .forEach(file => {
    const key = path.parse(file).name;
    panelModules[key] = require(path.join(__dirname, 'panels', file));
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
const commandsArray = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

// Add dynamically loaded commands
for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
        commandsArray.push(command.data.toJSON());
    } else {
        console.warn(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

// Add panel setup commands to registration array
for (const cmd of panelCommands) {
    commandsArray.push(cmd.toJSON());
}

// Function to register commands
async function registerCommands() {
    try {
        console.log('Started refreshing application (/) commands.');
        const rest = new REST({ version: '10' }).setToken(config.token);
        await rest.put(
            Routes.applicationGuildCommands(config.clientId, config.guildId),
            { body: commandsArray }
        );
        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error('Error registering commands:', error);
    }
}

// When bot is ready
client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);
    // Register commands on startup
    await registerCommands();
    // Setup ticket system
    setupTicketSystem(client);
});

// Add global error handler
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

// Login to Discord
client.login(config.token).catch(console.error);

// Add optional manual command registration
if (process.argv.includes('--register')) {
    registerCommands().catch(console.error);
}