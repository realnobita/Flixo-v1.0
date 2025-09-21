const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const fs = require('fs');
const path = require('path');

module.exports = {
  name: "help",
  aliases: ["h"],
  description: "Displays all available commands",
  category: "Info",
  cooldown: 5,
  run: async (client, message, args, prefix) => {
    // Custom emoji mappings (kept original)
    const emoji = {
      music: "<:white_musicnote:1365751118717518005>",
      filters: "<:filters:1366745132535250984>",
      playlist: "<:Playlist:1365751124723765354>",
      purge: "<:flash_white:1416062531025506326>",
      config: "<:white_ferramenta:1365751091731628192>",
      info: "<:white_info:1365751111285215233>"
    };

    // Get all command categories dynamically
    const categories = {};
    const commandsPath = path.join(__dirname, '..');
    const categoryFolders = fs.readdirSync(commandsPath);

    for (const folder of categoryFolders) {
      if (!fs.statSync(path.join(commandsPath, folder)).isDirectory()) continue;

      const commandFiles = fs.readdirSync(path.join(commandsPath, folder))
        .filter(file => file.endsWith('.js'));

      categories[folder] = commandFiles.map(file => {
        const command = require(path.join(commandsPath, folder, file));
        return `\`${command.name}\``;
      });
    }

    // Format category names
    const formattedCategories = {
      'Music': categories['Music'] || [],
      'Filters': categories['Filters'] || [],
      'Playlist': categories['Playlist'] || [],
      'Purge': categories['Purge'] || [],
      'Config': categories['Config'] || [],
      'Info': categories['Info'] || [],
    };

    // Main help embed with classic UI
    const mainEmbed = new EmbedBuilder()
      .setColor(client.color || '#2b2d31')
      .setAuthor({
        name: `${client.user.username}`,
        iconURL: client.user.displayAvatarURL(),
      })
      .setThumbnail(client.user.displayAvatarURL({ size: 256 }))
      .setDescription(`# Hey I'm <@${client.user.id}>.
**Prefix:** \`${prefix}\`
**Total Commands:** ${Object.values(categories).flat().length}`)
      .addFields(
        { name: '\u200B', value: '-# **Command Categories —**\n\n', inline: false }
      );

    // Add fields for each category with custom emojis
    for (const [category, commands] of Object.entries(formattedCategories)) {
      if (commands.length > 0) {
        const emojiKey = category.toLowerCase();
        mainEmbed.addFields({
          name: `${emoji[emojiKey]} ${category} Commands [${commands.length}]`,
          value: commands.join(', '),
          inline: false
        });
      }
    }

    mainEmbed.setFooter({ 
      text: `Executed by ${message.author.username}`,
      iconURL: message.author.displayAvatarURL() 
    });

    // Create buttons with custom style
    const supportButton = new ButtonBuilder()
      .setLabel('Support')
      .setURL('https://discord.gg/HaD5sYEj8w')
      .setStyle(ButtonStyle.Link);

    const premiumButton = new ButtonBuilder()
      .setLabel('Premium')
      .setURL('https://discord.gg/HaD5sYEj8w')
      .setStyle(ButtonStyle.Link);

    const inviteButton = new ButtonBuilder()
      .setLabel('Invite Me')
      .setURL(`https://discord.com/oauth2/authorize?client_id=1380994881731952741&permissions=100003281&scope=bot&response_type=code&redirect_uri=https://discord.gg/HaD5sYEj8w`)
      .setStyle(ButtonStyle.Link);
      
    const buttonRow = new ActionRowBuilder().addComponents(
      inviteButton, supportButton, premiumButton
    );

    // Send the message
    const msg = await message.channel.send({
      embeds: [mainEmbed],
      components: [buttonRow]
    });

    // Button timeout handler
    const collector = msg.createMessageComponentCollector({
      filter: i => i.user.id === message.author.id,
      time: 60000
    });

    collector.on('end', () => {
      const disabledRow = new ActionRowBuilder().addComponents(
        inviteButton.setDisabled(true),
        supportButton.setDisabled(true),
        premiumButton.setDisabled(true));
      
      msg.edit({ components: [disabledRow] }).catch(() => {});
    });
  },
};