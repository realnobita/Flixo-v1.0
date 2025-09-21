const {
  EmbedBuilder,
  WebhookClient,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require("discord.js");
const client = require("..");
const web = new WebhookClient({ url: `${client.config.join_log}` });

module.exports = async (client) => {
  client.on("guildCreate", async (guild) => {
    try {
      let inviter;
      try {
        const auditLogs = await guild.fetchAuditLogs({
          limit: 1,
          type: 28, // BOT_ADD
        });
        const entry = auditLogs.entries.first();
        inviter = entry?.executor || null;
      } catch (e) {
        inviter = null;
      }

      let mb = new EmbedBuilder()
        .setTitle(`Hey I am ${client.user.username}`)
        .setColor(client.color)
        .setAuthor({
          name: `Thanks for Inviting Me`,
          iconURL: client.user.displayAvatarURL(),
        })
        .setDescription(
          `<:arrow:1341073087688605696> I come up with default prefix as : \`${client.config.prefix}\`\n<:arrow:1341073087688605696> I am a High Quality Rythmic music bot with lots of unique features\n<:arrow:1341073087688605696> I come up with different search engines, You may try out me with \`play\`\n<:arrow:1341073087688605696> If you find any bug or want any kind of help regarding our services of Floovi Bot\n<:arrow:1341073087688605696> Please consider Joining [Support server](${client.config.ssLink}) by clicking [here](${client.config.ssLink})`
        )
        .setThumbnail(guild.iconURL({ dynamic: true }))
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel("Invite Me")
          .setStyle(ButtonStyle.Link)
          .setURL(`${client.invite}`),
        new ButtonBuilder()
          .setLabel("Support Server")
          .setStyle(ButtonStyle.Link)
          .setURL(`${client.config.ssLink}`),
        new ButtonBuilder()
          .setLabel("DBL")
          .setStyle(ButtonStyle.Link)
          .setURL(`${client.config.topGg}`)
      );

      if (inviter) {
        try {
          await inviter.send({ embeds: [mb], components: [row] });
        } catch {
          console.log(`Could not DM ${inviter.tag}`);
        }
      }

      const totalUsers = client.guilds.cache.reduce(
        (acc, g) => acc + (g.memberCount || 0),
        0
      );
      const totalGuilds = client.guilds.cache.size;

      let em = new EmbedBuilder()
        .setTitle(`Guild Joined`)
        .setColor(client.color)
        .setAuthor({
          name: `${client.user.username}`,
          iconURL: client.user.displayAvatarURL(),
        })
        .addFields([
          {
            name: `Guild Info`,
            value: `Guild Name: ${guild.name}\nGuild Id: ${
              guild.id
            }\nGuild Created: <t:${Math.round(
              guild.createdTimestamp / 1000
            )}:R>\nGuild Joined: <t:${Math.round(
              guild.joinedTimestamp / 1000
            )}:R>\nGuild Owner: ${
              (await guild.members.fetch(guild.ownerId))
                ? guild.members.cache.get(guild.ownerId).user.tag
                : "Unknown User"
            }\nMemberCount: ${guild.memberCount} Members\nShardId: ${
              guild.shardId
            }`,
          },
          {
            name: `Bot Info`,
            value: `**Servers:** ${totalGuilds}\n**Users:** ${totalUsers.toLocaleString()}`,
          },
        ])
        .setThumbnail(guild.iconURL({ dynamic: true }));

      await web.send({ embeds: [em] });
    } catch (err) {
      console.log("Error sending guild join webhook:", err);
    }
  });
};
