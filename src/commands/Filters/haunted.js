const { Message, PermissionFlagsBits, EmbedBuilder } = require("discord.js");

module.exports = {
  name: "haunted",
  aliases: ["ghostly", "spooky"],
  description: `Set a Haunted filter for the current song.`,
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
      timescale: {
        speed: 0.7,  // Slower for a spooky vibe
        pitch: 0.9, // Slightly lower pitch
        rate: 0.7   // Slower playback rate
      },
      reverb: {
        wet: 0.5,   // Strong reverb for echo
        roomSize: 0.8  // Large echo effect
      },
      tremolo: {
        frequency: 3.0,  // Tremolo for a haunting effect
        depth: 0.4
      }
    };

    await player.shoukaku.setFilters(data);

    const embed = new EmbedBuilder()
      .setDescription("<:tick:1341047511833645178> | **Turned on**: `Haunted`")
      .setColor(client.color);

    await delay(5000);
    return message.reply({ embeds: [embed] });
  },
};

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
