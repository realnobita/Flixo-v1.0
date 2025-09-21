const { EmbedBuilder, WebhookClient } = require("discord.js");
const client = require("..");
const web = new WebhookClient({ url: `${client.config.leave_log}` });

module.exports = async (client) => {
  client.on("guildDelete", async (guild) => {
    try {
      const totalUsers = client.guilds.cache.reduce(
        (acc, g) => acc + (g.memberCount || 0),
        0
      );
      const totalGuilds = client.guilds.cache.size;

      const em = new EmbedBuilder()
        .setTitle(`Guild Left`)
        .setColor(client.color)
        .setAuthor({
          name: `${client.user.username}`,
          iconURL: client.user.displayAvatarURL(),
        })
        .setThumbnail(guild.iconURL({ dynamic: true }))
        .addFields([
          {
            name: `Guild Info`,
            value: `Guild Name: ${guild.name}\nGuild Id: ${
              guild.id
            }\nGuild Created: <t:${Math.round(
              guild.createdTimestamp / 1000
            )}:R>\nMemberCount: ${guild.memberCount} Members`,
          },
          {
            name: `Bot Info`,
            value: `**Servers:** ${totalGuilds}\n**Users:** ${totalUsers.toLocaleString()}`,
          },
        ]);

      await web.send({ embeds: [em] });
    } catch (error) {
      console.log("Error sending guild left webhook:", error);
    }
  });
};
