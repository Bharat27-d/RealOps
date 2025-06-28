const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits
} = require('discord.js');

// ==== NOTIFICATION ROLES ====
// Make sure each role id is unique!
const NOTI_ROLES = [
  { id: '1353404794487967825', label: 'Event', emoji: '🎉', description: 'Get reminders and updates on our Anniversary Events!' },
  { id: '1353404794487967826', label: 'Socials', emoji: '💖', description: 'Get notifications of events and live reports on socials.' },
  { id: '1357061305445384232', label: 'Streamer', emoji: '🖥️', description: 'Get notifications when streamers go live.' }
];

const TITLE_ICON_URL = 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png';
const SIDE_IMAGE_URL = 'https://i.postimg.cc/5t3m40Nn/simple.png';

const EMBED_DESCRIPTION = `
👉 Hey want to be kept in the loop of events we have / are attending, Then why not register for our socials and events notifications below.

👉 To select what you want to be notified about, just click on the emoji below! You can pick one or all of the options, it's up to you!

🎉 **Event notifications:** Get reminders and updates on our Anniversary Events !

💖 **Socials notifications:** Get notifications of events we will be attending and live reports of the incidents as they happen. Support us by liking, commenting & liking our Face Book, Instagram & retweeting our latest X posts!

🖥️ **Streamer Notification.** get notifications when streamers go live.

Thanks for being part of our community, and we hope to see you around soon! 🎉
`;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('notireaction')
    .setDescription('Post the Socials and Event Notifications panel')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setAuthor({ name: 'The Real Ops Group Notifications', iconURL: TITLE_ICON_URL })
      .setTitle('Our socials and Event Notifications')
      .setDescription(EMBED_DESCRIPTION)
      .setThumbnail(TITLE_ICON_URL)
      .setImage(SIDE_IMAGE_URL)
      .setColor('#191C21')
      .setFooter({ text: 'The Real Ops Group', iconURL: TITLE_ICON_URL });

    const row = new ActionRowBuilder().addComponents(
      NOTI_ROLES.map(role =>
        new ButtonBuilder()
          .setCustomId(`notireaction_${role.id}`)
          .setLabel(role.emoji)
          .setStyle(ButtonStyle.Primary)
      )
    );

    await interaction.reply({ content: 'Notifications panel posted!', ephemeral: true });
    await interaction.channel.send({
      embeds: [embed],
      components: [row]
    });
  }
};