const {
  Message,
  PermissionFlagsBits,
  EmbedBuilder,
  ButtonStyle,
  ButtonBuilder,
  ActionRowBuilder,
} = require("discord.js");

module.exports = {
  name: "invite",
  aliases: ["inv"],
  description: "invite me",
  // userPermissions: PermissionFlagsBits.SendMessages,
  // botPermissions: PermissionFlagsBits.SendMessages,
  category: "Info",
  cooldown: 5,
  //premium: true,

  run: async (client, message, args, prefix) => {
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Invite Floovi")
        .setStyle(ButtonStyle.Link)
        .setURL(
          `https://discord.com/oauth2/authorize?client_id=1380994881731952741&permissions=100003281&scope=bot&response_type=code&redirect_uri=https://discord.gg/HaD5sYEj8w`
        ),
      new ButtonBuilder()
        .setLabel("Hq Link")
        .setStyle(ButtonStyle.Link)
        .setURL(`${client.config.ssLink}`)
    );

    message.reply({ content: `**Invite Me In Your Servers, For High Quality Music Ever!**`, components: [row] });
  },
};
