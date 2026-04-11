const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const { collections } = require('./firebase');

class DiscordBotManager {
  constructor() {
    this.client = null;
    // Cache to prevent rate limits
    this.cache = {
      members: { data: null, timestamp: 0, ttl: 300000 }, // 5 minutes
      channels: { data: null, timestamp: 0, ttl: 300000 }, // 5 minutes
      roles: { data: null, timestamp: 0, ttl: 300000 }, // 5 minutes
      guild: { data: null, timestamp: 0, ttl: 300000 } // 5 minutes
    };
  }

  // Check if cached data is still valid
  isCacheValid(cacheKey) {
    const cache = this.cache[cacheKey];
    return cache.data && (Date.now() - cache.timestamp < cache.ttl);
  }

  // Get from cache or fetch new data
  getCached(cacheKey) {
    if (this.isCacheValid(cacheKey)) {
      console.log(`Using cached ${cacheKey}`);
      return this.cache[cacheKey].data;
    }
    return null;
  }

  // Set cache data
  setCache(cacheKey, data) {
    this.cache[cacheKey] = {
      data,
      timestamp: Date.now(),
      ttl: this.cache[cacheKey].ttl
    };
  }

  initialize(token) {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent
      ]
    });

    // Debug log for Discord bot token
    console.log('DEBUG: DISCORD_BOT_TOKEN used for login:', token);

    this.client.login(token);

    this.client.once('clientReady', () => {
      console.log(`✅ Bot logged in as ${this.client.user.tag}`);
    });
  }

  // Send embed to channel
  async sendEmbed(channelId, embedData, content = null) {
    try {
      const channel = await this.client.channels.fetch(channelId);
      if (!channel) throw new Error('Channel not found');

      // Validate and normalize color to 6-digit hex
      let color = embedData.color || '#00b894';
      
      // Convert to string if it's a number
      if (typeof color === 'number') {
        color = color.toString(16).padStart(6, '0');
      } else if (typeof color !== 'string') {
        color = '00b894';
      } else if (color.startsWith('#')) {
        color = color.substring(1);
      }
      
      // Ensure it's exactly 6 characters, pad with 0s or use default
      if (!/^[0-9A-Fa-f]{6}$/.test(color)) {
        console.log(`Invalid color format: ${embedData.color}, using default #00b894`);
        color = '00b894';
      }
      color = `#${color}`;

      const embed = new EmbedBuilder()
        .setTitle(embedData.title || null)
        .setDescription(embedData.description || null)
        .setColor(color)
        .setTimestamp(embedData.timestamp ? new Date() : null);

      // Only set author if name is provided and not empty
      if (embedData.author && embedData.author.name && embedData.author.name.trim()) {
        embed.setAuthor({
          name: embedData.author.name,
          iconURL: embedData.author.iconURL || undefined
        });
      }

      // Only set URL if provided and not empty
      if (embedData.url && embedData.url.trim()) {
        embed.setURL(embedData.url);
      }

      if (embedData.footer) {
        // Handle both string and object format for footer
        if (typeof embedData.footer === 'string' && embedData.footer.trim()) {
          embed.setFooter({ text: embedData.footer });
        } else if (embedData.footer.text && embedData.footer.text.trim()) {
          embed.setFooter({
            text: embedData.footer.text,
            iconURL: embedData.footer.iconURL || undefined
          });
        }
      }

      if (embedData.thumbnail && embedData.thumbnail.trim()) {
        embed.setThumbnail(embedData.thumbnail);
      }
      
      if (embedData.image && embedData.image.trim()) {
        embed.setImage(embedData.image);
      }

      // Only add fields that have both name and value
      if (embedData.fields && embedData.fields.length > 0) {
        const validFields = embedData.fields.filter(f => 
          f.name && f.name.trim() && f.value && f.value.trim()
        );
        if (validFields.length > 0) {
          embed.addFields(validFields);
        }
      }

      const components = [];
      if (embedData.buttons && embedData.buttons.length > 0) {
        const row = new ActionRowBuilder();
        embedData.buttons.forEach(btn => {
          row.addComponents(
            new ButtonBuilder()
              .setCustomId(btn.customId || `btn_${Date.now()}`)
              .setLabel(btn.label)
              .setStyle(btn.style || ButtonStyle.Primary)
              .setEmoji(btn.emoji || null)
          );
        });
        components.push(row);
      }

      if (embedData.selectMenu) {
        const row = new ActionRowBuilder()
          .addComponents(
            new StringSelectMenuBuilder()
              .setCustomId(embedData.selectMenu.customId || `select_${Date.now()}`)
              .setPlaceholder(embedData.selectMenu.placeholder || 'Select an option')
              .addOptions(embedData.selectMenu.options)
          );
        components.push(row);
      }

      const message = await channel.send({
        content: content || embedData.content || null,
        embeds: [embed],
        components: components.length > 0 ? components : [],
        allowedMentions: {
          parse: ['roles', 'users', 'everyone']
        }
      });

      return { success: true, messageId: message.id };
    } catch (error) {
      console.error('Error sending embed:', error);
      throw error;
    }
  }

  // Send multiple embeds (scenario pack system)
  async sendMultipleEmbeds(channelId, embedsData) {
    try {
      const channel = await this.client.channels.fetch(channelId);
      if (!channel) throw new Error('Channel not found');

      const embeds = embedsData.map(data => {
        const embed = new EmbedBuilder()
          .setTitle(data.title || null)
          .setDescription(data.description || null)
          .setColor(data.color || '#00b894')
          .setTimestamp(data.timestamp ? new Date() : null);

        if (data.footer) {
          embed.setFooter({
            text: data.footer.text,
            iconURL: data.footer.iconURL || null
          });
        }

        if (data.thumbnail) {
          console.log('Setting thumbnail for scenario:', data.thumbnail);
          embed.setThumbnail(data.thumbnail);
        }
        
        if (data.image) {
          console.log('Setting image for scenario:', data.image);
          embed.setImage(data.image);
        }

        return embed;
      });

      const message = await channel.send({
        content: embedsData[0]?.mention || null,
        embeds
      });

      return { success: true, messageId: message.id };
    } catch (error) {
      console.error('Error sending multiple embeds:', error);
      throw error;
    }
  }

  // Send DM to user
  async sendDM(userId, content, embed = null) {
    try {
      const user = await this.client.users.fetch(userId);
      if (!user) throw new Error('User not found');

      const messageOptions = { content };
      if (embed) {
        const embedObj = new EmbedBuilder()
          .setTitle(embed.title || null)
          .setDescription(embed.description || null)
          .setColor(embed.color || '#00b894');
        messageOptions.embeds = [embedObj];
      }

      await user.send(messageOptions);
      return { success: true };
    } catch (error) {
      console.error('Error sending DM:', error);
      throw error;
    }
  }

  // Get guild members (staff only) with caching to prevent rate limits
  async getGuildMembers(roleIds = []) {
    try {
      // Check cache first
      let allMembers = this.getCached('members');
      
      if (!allMembers) {
        console.log('Fetching guild members from Discord API...');
        const guild = await this.client.guilds.fetch(process.env.DISCORD_GUILD_ID);
        
        // Use chunk-based fetching to avoid rate limits
        const members = await guild.members.fetch({ limit: 1000 });
        
        // Convert Collection to Array before mapping
        allMembers = Array.from(members.values()).map(member => ({
          id: member.user.id,
          username: member.user.username,
          discriminator: member.user.discriminator,
          avatar: member.user.displayAvatarURL(),
          nickname: member.nickname,
          roles: Array.from(member.roles.cache.values()).map(role => ({
            id: role.id,
            name: role.name,
            color: role.hexColor
          })),
          joinedAt: member.joinedAt
        }));
        
        // Cache the results
        this.setCache('members', allMembers);
        console.log(`Cached ${allMembers.length} guild members`);
      } else {
        console.log(`Using cached members: ${allMembers.length} members`);
      }

      // Ensure allMembers is always an array
      if (!Array.isArray(allMembers)) {
        console.error('allMembers is not an array:', typeof allMembers);
        return [];
      }

      // Filter by roles if specified
      if (roleIds.length > 0) {
        const filtered = allMembers.filter(member =>
          member.roles.some(role => roleIds.includes(role.id))
        );
        console.log(`Filtered to ${filtered.length} members with roles:`, roleIds);
        return filtered;
      }

      console.log(`Returning all ${allMembers.length} members`);
      return allMembers;
    } catch (error) {
      console.error('Error getting guild members:', error);
      // If rate limited, return cached data even if expired
      if (error.code === 'RATE_LIMIT' && this.cache.members.data) {
        console.log('Rate limited, returning stale cache');
        const cachedData = this.cache.members.data;
        return Array.isArray(cachedData) ? cachedData : [];
      }
      // Return empty array instead of throwing to prevent frontend crashes
      console.error('Returning empty array due to error');
      return [];
    }
  }

  // Add role to user
  async addRole(userId, roleId) {
    try {
      const guild = await this.client.guilds.fetch(process.env.DISCORD_GUILD_ID);
      const member = await guild.members.fetch(userId);
      await member.roles.add(roleId);
      return { success: true };
    } catch (error) {
      console.error('Error adding role:', error);
      throw error;
    }
  }

  // Remove role from user
  async removeRole(userId, roleId) {
    try {
      const guild = await this.client.guilds.fetch(process.env.DISCORD_GUILD_ID);
      const member = await guild.members.fetch(userId);
      await member.roles.remove(roleId);
      return { success: true };
    } catch (error) {
      console.error('Error removing role:', error);
      throw error;
    }
  }

  // Get channel list with caching (text channels only)
  async getChannels() {
    try {
      // Check cache first
      let channelList = this.getCached('channels');
      
      if (!channelList) {
        console.log('Fetching channels from Discord API...');
        const guild = await this.client.guilds.fetch(process.env.DISCORD_GUILD_ID);
        const channels = await guild.channels.fetch();

        channelList = channels
          .filter(channel => channel.isTextBased())
          .map(channel => ({
            id: channel.id,
            name: channel.name,
            type: channel.type,
            position: channel.position
          }))
          .sort((a, b) => a.position - b.position);
        
        // Cache the results
        this.setCache('channels', channelList);
      }

      return channelList;
    } catch (error) {
      console.error('Error getting channels:', error);
      // Return cached data if available
      if (this.cache.channels.data) {
        console.log('Error occurred, returning stale cache');
        return this.cache.channels.data;
      }
      throw error;
    }
  }

  // Get categories (category channels)
  async getCategories() {
    try {
      console.log('Fetching categories from Discord API...');
      const guild = await this.client.guilds.fetch(process.env.DISCORD_GUILD_ID);
      const channels = await guild.channels.fetch();

      const categories = channels
        .filter(channel => channel.type === 4) // CategoryChannel type
        .map(channel => ({
          id: channel.id,
          name: channel.name,
          type: channel.type,
          position: channel.position
        }))
        .sort((a, b) => a.position - b.position);

      return categories;
    } catch (error) {
      console.error('Error getting categories:', error);
      throw error;
    }
  }

  // Get roles with caching
  async getRoles() {
    try {
      // Check cache first
      let roleList = this.getCached('roles');
      
      if (!roleList) {
        console.log('Fetching roles from Discord API...');
        const guild = await this.client.guilds.fetch(process.env.DISCORD_GUILD_ID);
        const roles = await guild.roles.fetch();

        roleList = roles.map(role => ({
          id: role.id,
          name: role.name,
          color: role.hexColor,
          position: role.position,
          permissions: role.permissions.toArray()
        })).sort((a, b) => b.position - a.position);
        
        // Cache the results
        this.setCache('roles', roleList);
      }

      return roleList;
    } catch (error) {
      console.error('Error getting roles:', error);
      // Return cached data if available
      if (this.cache.roles.data) {
        console.log('Error occurred, returning stale cache');
        return this.cache.roles.data;
      }
      throw error;
    }
  }

  // Get count of members with a specific role
  async getMembersWithRoleCount(roleId) {
    try {
      // Check cache first to prevent rate limiting
      const cacheKey = `roleCount_${roleId}`;
      if (!this.cache[cacheKey]) {
        this.cache[cacheKey] = { data: null, timestamp: 0, ttl: 300000 }; // 5 minute cache (increased from 1 min)
      }
      
      if (this.isCacheValid(cacheKey)) {
        return this.cache[cacheKey].data;
      }
      
      const guild = await this.client.guilds.fetch(process.env.DISCORD_GUILD_ID);
      
      // Only fetch members if cache is stale - don't overwrite the members cache here
      // The actual members array is cached in getGuildMembers()
      if (!this.isCacheValid('members')) {
        await guild.members.fetch();
        // Don't set cache here - it's managed by getGuildMembers()
      }
      
      const role = await guild.roles.fetch(roleId);
      if (!role) {
        console.log(`Role ${roleId} not found`);
        return 0;
      }
      
      const count = role.members.size;
      this.setCache(cacheKey, count);
      return count;
    } catch (error) {
      console.error('Error getting members with role:', error);
      return 0;
    }
  }

  // Clear all caches (useful for admin refresh)
  clearCache() {
    console.log('Clearing all Discord data caches');
    this.cache.members.data = null;
    this.cache.channels.data = null;
    this.cache.roles.data = null;
    this.cache.guild.data = null;
  }

  // Send multiple embeds in one message
  async sendMultipleEmbeds(channelId, embedsData, content = null) {
    try {
      const channel = await this.client.channels.fetch(channelId);
      if (!channel) throw new Error('Channel not found');

      const embeds = embedsData.map(embedData => {
        // Validate and normalize color
        let color = embedData.color || '#00b894';
        if (color.startsWith('#')) {
          color = color.substring(1);
        }
        if (!/^[0-9A-Fa-f]{6}$/.test(color)) {
          color = '00b894';
        }
        color = `#${color}`;

        const embed = new EmbedBuilder()
          .setTitle(embedData.title || null)
          .setDescription(embedData.description || null)
          .setColor(color)
          .setTimestamp(embedData.timestamp ? new Date() : null);

        if (embedData.author && embedData.author.name && embedData.author.name.trim()) {
          embed.setAuthor({
            name: embedData.author.name,
            iconURL: embedData.author.iconURL || undefined
          });
        }

        if (embedData.url && embedData.url.trim()) {
          embed.setURL(embedData.url);
        }

        if (embedData.footer) {
          if (typeof embedData.footer === 'string' && embedData.footer.trim()) {
            embed.setFooter({ text: embedData.footer });
          } else if (embedData.footer.text && embedData.footer.text.trim()) {
            embed.setFooter({
              text: embedData.footer.text,
              iconURL: embedData.footer.iconURL || undefined
            });
          }
        }

        if (embedData.thumbnail && embedData.thumbnail.trim()) {
          embed.setThumbnail(embedData.thumbnail);
        }

        if (embedData.image && embedData.image.trim()) {
          embed.setImage(embedData.image);
        }

        if (embedData.fields && embedData.fields.length > 0) {
          const validFields = embedData.fields.filter(f => f.name && f.name.trim() && f.value && f.value.trim());
          if (validFields.length > 0) {
            embed.addFields(validFields);
          }
        }

        return embed;
      });

      const messageOptions = { embeds };
      
      // Add content (for mentions) if provided
      if (content) {
        messageOptions.content = content;
        messageOptions.allowedMentions = {
          parse: ['roles', 'users', 'everyone']
        };
      }

      const message = await channel.send(messageOptions);

      return {
        success: true,
        messageId: message.id,
        channelId: message.channel.id,
        url: message.url
      };
    } catch (error) {
      console.error('Error sending multiple embeds:', error);
      throw error;
    }
  }

  // Create forum thread
  async createForumThread(forumId, title, message) {
    try {
      const forum = await this.client.channels.fetch(forumId);
      if (!forum || forum.type !== 15) { // 15 = GUILD_FORUM
        throw new Error('Channel is not a forum');
      }

      const thread = await forum.threads.create({
        name: title,
        message: { content: message },
        autoArchiveDuration: 10080 // 7 days
      });

      return {
        success: true,
        threadId: thread.id,
        threadName: thread.name
      };
    } catch (error) {
      console.error('Error creating forum thread:', error);
      throw error;
    }
  }

  // Lock forum thread
  async lockForumThread(threadId) {
    try {
      const thread = await this.client.channels.fetch(threadId);
      if (!thread || !thread.isThread()) {
        throw new Error('Channel is not a thread');
      }

      await thread.setLocked(true);
      return { success: true };
    } catch (error) {
      console.error('Error locking thread:', error);
      throw error;
    }
  }

  // Archive forum thread
  async archiveForumThread(threadId) {
    try {
      const thread = await this.client.channels.fetch(threadId);
      if (!thread || !thread.isThread()) {
        throw new Error('Channel is not a thread');
      }

      await thread.setArchived(true);
      return { success: true };
    } catch (error) {
      console.error('Error archiving thread:', error);
      throw error;
    }
  }

  // Fetch a message and extract embed data
  async fetchMessage(channelId, messageId) {
    try {
      const channel = await this.client.channels.fetch(channelId);
      if (!channel) throw new Error('Channel not found');

      const message = await channel.messages.fetch(messageId);
      if (!message) throw new Error('Message not found');

      const result = {
        messageId: message.id,
        channelId: message.channel.id,
        content: message.content || '',
        embeds: [],
        components: []
      };

      // Extract embed data
      if (message.embeds && message.embeds.length > 0) {
        result.embeds = message.embeds.map(embed => ({
          title: embed.title || '',
          description: embed.description || '',
          color: embed.hexColor || '#00b894',
          thumbnail: embed.thumbnail?.url || '',
          image: embed.image?.url || '',
          footer: {
            text: embed.footer?.text || '',
            iconURL: embed.footer?.iconURL || ''
          },
          author: {
            name: embed.author?.name || '',
            iconURL: embed.author?.iconURL || ''
          },
          fields: (embed.fields || []).map(f => ({
            name: f.name,
            value: f.value,
            inline: f.inline || false
          })),
          timestamp: !!embed.timestamp,
          url: embed.url || ''
        }));
      }

      return result;
    } catch (error) {
      console.error('Error fetching message:', error);
      throw error;
    }
  }

  // Edit an existing message's embed(s)
  async editMessage(channelId, messageId, embedData, content = null) {
    try {
      const channel = await this.client.channels.fetch(channelId);
      if (!channel) throw new Error('Channel not found');

      const message = await channel.messages.fetch(messageId);
      if (!message) throw new Error('Message not found');

      // Check if the bot is the author
      if (message.author.id !== this.client.user.id) {
        throw new Error('Cannot edit messages sent by other users');
      }

      // Build the new embed
      let color = embedData.color || '#00b894';
      if (typeof color === 'number') {
        color = color.toString(16).padStart(6, '0');
      } else if (typeof color !== 'string') {
        color = '00b894';
      } else if (color.startsWith('#')) {
        color = color.substring(1);
      }
      if (!/^[0-9A-Fa-f]{6}$/.test(color)) {
        color = '00b894';
      }
      color = `#${color}`;

      const embed = new EmbedBuilder()
        .setTitle(embedData.title || null)
        .setDescription(embedData.description || null)
        .setColor(color)
        .setTimestamp(embedData.timestamp ? new Date() : null);

      if (embedData.author && embedData.author.name && embedData.author.name.trim()) {
        embed.setAuthor({
          name: embedData.author.name,
          iconURL: embedData.author.iconURL || undefined
        });
      }

      if (embedData.url && embedData.url.trim()) {
        embed.setURL(embedData.url);
      }

      if (embedData.footer) {
        if (typeof embedData.footer === 'string' && embedData.footer.trim()) {
          embed.setFooter({ text: embedData.footer });
        } else if (embedData.footer.text && embedData.footer.text.trim()) {
          embed.setFooter({
            text: embedData.footer.text,
            iconURL: embedData.footer.iconURL || undefined
          });
        }
      }

      if (embedData.thumbnail && embedData.thumbnail.trim()) {
        embed.setThumbnail(embedData.thumbnail);
      }

      if (embedData.image && embedData.image.trim()) {
        embed.setImage(embedData.image);
      }

      if (embedData.fields && embedData.fields.length > 0) {
        const validFields = embedData.fields.filter(f =>
          f.name && f.name.trim() && f.value && f.value.trim()
        );
        if (validFields.length > 0) {
          embed.addFields(validFields);
        }
      }

      const editOptions = { embeds: [embed] };
      if (content !== null) {
        editOptions.content = content;
      }

      await message.edit(editOptions);

      return { success: true, messageId: message.id };
    } catch (error) {
      console.error('Error editing message:', error);
      throw error;
    }
  }
}

const botManager = new DiscordBotManager();
module.exports = botManager;
