const { EmbedBuilder } = require("discord.js");
const mongoose = require("mongoose");

module.exports = {
  name: "ping",
  aliases: [],
  description: "Check bot and database latency",
  category: "Info",
  run: async (client, message, args) => {
    try {
      const msg = await message.channel.send("Pinging...");

      // Calculate Bot Latency
      const botLatency = msg.createdTimestamp - message.createdTimestamp;
      const apiLatency = Math.round(client.ws.ping);

      // Calculate DB Latency
      const dbStart = Date.now();
      await mongoose.connection.db.admin().ping();
      const dbLatency = Date.now() - dbStart;

      const embed = new EmbedBuilder()
        .setAuthor({ name: `Pong 🏓`, iconURL: client.user.displayAvatarURL() })
        .setColor(0x2f3136) // Transparent dark color
        .setDescription(
          `**Bot Latency:** \`${botLatency}ms\`\n` +
          `**API Latency:** \`${apiLatency}ms\`\n` +
          `**Database Latency:** \`${dbLatency}ms\``
        )
        .setFooter({ text: `${client.user.username} Ping Command`, iconURL: message.guild.iconURL({ dynamic: true }) })
        .setTimestamp();

      await msg.edit({ content: "", embeds: [embed] });
    } catch (err) {
      console.error(err);
      message.reply("An error occurred while checking the ping.");
    }
  }
};