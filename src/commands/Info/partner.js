const { Message, PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");

module.exports = {
  name: "partner",
  aliases: ["sponser"],
  description: "Get Bot Sponsers !!",
  // userPermissions: PermissionFlagsBits.SendMessages,
  // botPermissions: PermissionFlagsBits.SendMessages,
  category: "Info",
  cooldown: 5,

  run: async (client, message, args, prefix) => {
    const embed = new EmbedBuilder()
      .setColor(client.color)
      .setTitle(`Floovi - Partners`)
      .setDescription(`**Currently, We Don't Have any partners Now, If you want to do partnership with the Floovi Then, Join Support Server**`);

    const button = new ButtonBuilder()
      .setLabel(`Support Server`)
      .setStyle(ButtonStyle.Link)
      .setEmoji("<:support:1279039313451159553>")
      .setURL(`https://discord.gg/G4Uc7mwfwM`);

    const row = new ActionRowBuilder().addComponents(button);

    return message.reply({
      embeds: [embed],
      components: [row]
    });
  },
};
