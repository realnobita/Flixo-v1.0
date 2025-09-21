const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "skip",
  aliases: ["s"],
  description: `Skips the song currently playing.`,
  category: "Music",
  inVc: true,
  sameVc: true,
  dj: true,

  run: async (client, message, args, prefix, player) => {
    const tick = "<:floovi_tick:1381965556277710860>";
    const cross = "<:floovi_cross:1382029455601569904>";

    if (!player) {
      const embed = new EmbedBuilder()
        .setColor(client.color)
        .setDescription(`${cross} | No song is currently playing.\nStart playing something to skip.`);
      return message.reply({ embeds: [embed] });
    }

    if (player.paused) {
      const embed = new EmbedBuilder()
        .setColor(client.color)
        .setDescription(`${cross} | You can't skip while the music is paused.\nUse \`${prefix}resume\` first.`);
      return message.reply({ embeds: [embed] });
    }

    // Skip 1 song by default
    if (!args[0]) {
      await player.skip();
      const embed = new EmbedBuilder()
        .setColor(client.color)
        .setDescription(`${tick} | Skipped the current song.\nPlaying the next one in the queue.`);
      return message.reply({ embeds: [embed] });
    }

    // If skipping multiple songs
    const amount = parseInt(args[0]);
    if (isNaN(amount) || amount < 1) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(client.color)
            .setDescription(`${cross} | Please provide a valid number greater than \`0\`.`),
        ],
      });
    }

    if (amount > player.queue.length) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(client.color)
            .setDescription(`${cross} | There aren't that many songs in the queue to skip.`),
        ],
      });
    }

    player.queue.remove(0, amount);
    player.skip();

    const embed = new EmbedBuilder()
      .setColor(client.color)
      .setDescription(`${tick} | Skipped \`${amount}\` song(s).\nPlaying the next one from the queue.`);

    return message.reply({ embeds: [embed] });
  },
};