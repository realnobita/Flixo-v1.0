const { Message, EmbedBuilder } = require("discord.js");

module.exports = {
  name: "ambient",
  aliases: ["atmospheric"],
  description: `Set an Ambient filter for the current song.`,
  category: "Filters",
  cooldown: 5,
  inVc: true,
  sameVc: true,
  dj: true,
  premium: false,
  run: async (client, message, args, prefix, player) => {
    if (!player) {
      const embed = new EmbedBuilder()
        .setDescription("<:cross:1341048111740489851> | No Player Found For This Guild!")
        .setColor(client.config.color);
      return message.channel.send({ embeds: [embed] });
    }

    const data = {
      op: "filters",
      guildId: message.guild.id,
      equalizer: [
        { band: 0, gain: 0.2 },  // Boost low frequencies for warmth
        { band: 1, gain: 0.1 },
        { band: 2, gain: 0 },
        { band: 3, gain: -0.2 }, // Reduce mids for a softer sound
        { band: 4, gain: -0.4 }, // Heavy muffling for highs
        { band: 5, gain: -0.5 },
        { band: 6, gain: -0.6 },
        { band: 7, gain: -0.6 },
        { band: 8, gain: -0.5 },
        { band: 9, gain: -0.3 },
        { band: 10, gain: -0.1 },
        { band: 11, gain: 0 }
      ],
      reverb: {
        wet: 0.6, // Strong reverb for atmosphere
        roomSize: 0.9, // Large room size
        damping: 0.5 // Echo damping
      }
    };

    await player.shoukaku.setFilters(data);

    const embed = new EmbedBuilder()
      .setDescription("<:tick:1341047511833645178> | **Turned on**: `Ambient`")
      .setColor(client.color);

    await delay(5000);
    return message.reply({ embeds: [embed] });
  },
};

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
