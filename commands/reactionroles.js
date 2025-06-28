const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits
} = require('discord.js');

// ==== CONFIGURE ROLES, LABELS, EMOJIS ====
// Replace these IDs with your actual role IDs
const VTC_ROLES = [
  { id: '1325812176543289354', label: 'Black Pearl Trucking', emoji: '1️⃣' },
  { id: '1304544433571627119', label: 'Pean Logistics', emoji: '2️⃣' },
  { id: '1304543116329619488', label: 'GTLegion', emoji: '3️⃣' },
  { id: '1304545662720933969', label: 'JudgeLog Group', emoji: '4️⃣' },
  { id: '1323397978785976505', label: 'Güven Logistics', emoji: '5️⃣' },
  { id: '1324465123318038550', label: 'Ponc Logistics', emoji: '6️⃣' },
  { id: '1384142381825130586', label: 'Turkish Line', emoji: '7️⃣' },
  { id: '1384142745417027616', label: 'Indian Group', emoji: '8️⃣' },
  { id: '1384143039152521397', label: 'Starcem Logistics', emoji: '9️⃣' },
  { id: '1387745283957456907', label: 'IEG - Group', emoji: '🔟' } // <-- Replace with actual role ID
];

const GROUP_ROLES = [
  { id: '1323401537988333629', label: 'Marking Events', emoji: '🇦' },
  { id: '1304863469987823696', label: 'Elite Convoys', emoji: '🇧' },
  { id: '1304545075006668872', label: 'Need CC', emoji: '🇨' },
  { id: '1304546220341198929', label: 'Super Event', emoji: '🇩' },
  { id: '1308548543098916864', label: 'Trucky', emoji: '🇪' },
  { id: '1386082169910202588', label: 'Storm Media', emoji: '🇫' }
];

// Utility function to chunk an array into smaller arrays of a given size
function chunkArray(array, chunkSize) {
  const temp = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    temp.push(array.slice(i, i + chunkSize));
  }
  return temp;
}

// ==== EMBED CONTENT (styled per your screenshot) ====
// Title Icon URL
const TITLE_ICON_URL = 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png';

const EMBED_TITLE = `**<:realops:${TITLE_ICON_URL}> Real Ops Partner Roles**`;
const EMBED_DESCRIPTION =
`**Partner Reaction Roles**

If you are a member of one of our partners you can assign your role here by selecting your **VTC** or **Group** below.

__**VTC's**__
${VTC_ROLES.map(r => `${r.emoji} **${r.label}**`).join('\n')}

__**Groups**__
${GROUP_ROLES.map(r => `${r.emoji} **${r.label}**`).join('\n')}
`;

const EMBED_THUMBNAIL = 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png';
const EMBED_IMAGE = 'https://i.postimg.cc/5t3m40Nn/simple.png';
const EMBED_FOOTER_TEXT = 'The Real Ops Group';
const EMBED_FOOTER_ICON = 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reactionroles')
    .setDescription('Post an embed with buttons for partner/team role assignment')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setAuthor({ name: 'Real Ops Partner Roles', iconURL: TITLE_ICON_URL }) // Title icon and title
      .setTitle('Partner Reaction Roles')
      .setDescription(EMBED_DESCRIPTION)
      .setThumbnail(EMBED_THUMBNAIL)
      .setImage(EMBED_IMAGE)
      .setColor('#191C21')
      .setFooter({ text: EMBED_FOOTER_TEXT, iconURL: EMBED_FOOTER_ICON });

    const ALL_ROLES = [...VTC_ROLES, ...GROUP_ROLES];
    const buttonChunks = chunkArray(ALL_ROLES, 5);
    const rows = buttonChunks.map(chunk =>
      new ActionRowBuilder().addComponents(
        chunk.map(role =>
          new ButtonBuilder()
            .setCustomId(`reactionrole_${role.id}`)
            .setLabel(role.emoji)
            .setStyle(ButtonStyle.Primary)
        )
      )
    );

    // Respond with an ephemeral message (won't show in channel)
    await interaction.reply({ content: 'Partner role panel posted!', ephemeral: true });

    // Post the actual embed with buttons to the channel
    await interaction.channel.send({
      embeds: [embed],
      components: rows,
    });
  }
};