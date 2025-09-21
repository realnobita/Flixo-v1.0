const { Message, PermissionFlagsBits, EmbedBuilder } = require("discord.js");

module.exports = {
  name: "clear",
  aliases: ["clearqueue"],
  description: `Clear song in queue!`,
  // userPermissions: PermissionFlagsBits.SendMessages,
  // botPermissions: PermissionFlagsBits.SendMessages,
  category: "Music",
  cooldown: 5,
  inVc: true,
  sameVc: true,
  premium: false,
  dj: true,
  run: async (client, message, args, prefix, player) => {
    if (!player) {
      const embed = new EmbedBuilder()
        .setDescription("<:cross:1341048111740489851> | No Player Found For This Guild!")
        .setColor(client.config.color);
      return message.channel.send({ embeds: [embed] });
    }

    await player.queue.clear();

    const embed = new EmbedBuilder()
      .setDescription("<:tick:1341047511833645178> | *Queue has been:* `Cleared`")
      .setColor(client.color);

    return message.reply({ embeds: [embed] });
  },
};
