const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits
} = require('discord.js');
const { getOverride } = require('../commandConfig');

const VTC_ROLES = [
  { id: '1325812176543289354', label: 'Black Pearl Trucking', emoji: '1️⃣' },
  { id: '1304544433571627119', label: 'Pean Logistics', emoji: '2️⃣' },
  { id: '1304543116329619488', label: 'GTLegion', emoji: '3️⃣' },
  { id: '1304545662720933969', label: 'Chocolate Express', emoji: '4️⃣' },
  { id: '1323397978785976505', label: 'Güven Logistics', emoji: '5️⃣' },
  { id: '1324465123318038550', label: 'Ponc Logistics', emoji: '6️⃣' },
  { id: '1384142381825130586', label: 'Turkish Line', emoji: '7️⃣' },
  { id: '1384142745417027616', label: 'Indian Group', emoji: '8️⃣' },
  { id: '1384143039152521397', label: 'Starcem Logistics', emoji: '9️⃣' }
];

const GROUP_ROLES = [
  { id: '1323401537988333629', label: 'Marking Events', emoji: '🇦' },
  { id: '1304863469987823696', label: 'Elite Convoys', emoji: '🇧' },
  { id: '1304545075006668872', label: 'Need CC', emoji: '🇨' },
  { id: '1304546220341198929', label: 'Super Event', emoji: '🇩' },
  { id: '1397218795436900493', label: 'United Convoys', emoji: '🇪' },
  { id: '1308548543098916864', label: 'Trucky', emoji: '🇫' },
  { id: '1386082169910202588', label: 'Storm Media', emoji: '🇬' },
  { id: '1429442654005104720', label: 'OCSC', emoji: '🇭' },
  { id: '1409566158201421926', label: 'Vanguard Convoy Control', emoji: '🇮' },
  { id: '1409595767014035597', label: 'Convoy Escort Service PL', emoji: '🇯' },
  { id: '1431313765449601124', label: 'NextGen CC', emoji: '🇰' }
];

function chunkArray(array, chunkSize) {
  const temp = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    temp.push(array.slice(i, i + chunkSize));
  }
  return temp;
}

const TITLE_ICON_URL = 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png';

const EMBED_TITLE = `**<:realops:${TITLE_ICON_URL}> Real Ops Partner Roles**`;
const DEFAULT_DESCRIPTION =
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
    try {
      await interaction.deferReply({ flags: 64 });

      const embed = new EmbedBuilder()
        .setAuthor({ name: 'Real Ops Partner Roles', iconURL: getOverride('reactionroles', 'thumbnail', TITLE_ICON_URL) })
        .setDescription(getOverride('reactionroles', 'description', DEFAULT_DESCRIPTION))
        .setThumbnail(getOverride('reactionroles', 'thumbnail', EMBED_THUMBNAIL))
        .setImage(getOverride('reactionroles', 'image', EMBED_IMAGE))
        .setColor(getOverride('reactionroles', 'color', '#FF0000'))
        .setFooter({ text: getOverride('reactionroles', 'footerText', EMBED_FOOTER_TEXT), iconURL: getOverride('reactionroles', 'footerIcon', EMBED_FOOTER_ICON) });

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

      await interaction.editReply({ content: 'Partner role panel posted!' });

      await interaction.channel.send({
        embeds: [embed],
        components: rows,
      });
    } catch (error) {
      console.error('Error in /reactionroles:', error);
      if (!interaction.replied && !interaction.deferred) {
        try {
          await interaction.reply({ content: 'An error occurred while posting the reaction roles panel.', flags: 64 });
        } catch (err) {}
      } else if (interaction.deferred && !interaction.replied) {
        try {
          await interaction.editReply({ content: 'An error occurred while posting the reaction roles panel.' });
        } catch (err) {}
      }
    }
  }
};

