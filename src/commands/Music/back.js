const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "back",
  aliases: ["b", "previous"],
  description: "Returns to the previous song.",
  category: "Music",
  inVc: true,
  sameVc: true,
  dj: true,

  run: async (client, message, args, prefix) => {
    const queue = client.kazagumo.getQueue(message.guild.id);
    
    if (!queue) {
      const embed = new EmbedBuilder()
        .setDescription("No player found for this guild!")
        .setColor(client.config.color);
      return message.channel.send({ embeds: [embed] });
    }

    if (!queue.previous) {
      const embed = new EmbedBuilder()
        .setDescription("There is no previous song to play!")
        .setColor(client.config.color);
      return message.channel.send({ embeds: [embed] });
    }

    try {
      await queue.play(queue.previous);
      const embed = new EmbedBuilder()
        .setDescription("Now playing the previous song.")
        .setColor(client.config.color);
      return message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      const embed = new EmbedBuilder()
        .setDescription("Failed to play the previous song.")
        .setColor(client.config.color);
      return message.channel.send({ embeds: [embed] });
    }
  },
};