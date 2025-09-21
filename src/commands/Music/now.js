const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "nowplaying",
  aliases: ["np", "now"],
  description: "Show the current song and next 3 in queue",
  category: "Music",
  owner: false,
  inVc: true,
  sameVc: false, // handle kar rahe hai manually
  premium: false,
  dj: true,

  run: async (client, message, args, prefix) => {
    try {
      const player = client.manager.players.get(message.guild.id);
      if (!player) {
        return message.channel.send({
          embeds: [
            new EmbedBuilder()
              .setColor(client.color)
              .setAuthor({ name: "No Player Found" })
              .setDescription("There is no active player in this server."),
          ],
        });
      }

      const current = player.queue.current; // ✅ fix
      if (!current) {
        return message.channel.send({
          embeds: [
            new EmbedBuilder()
              .setColor(client.color)
              .setAuthor({ name: "Nothing Playing" })
              .setDescription("No track is currently playing."),
          ],
        });
      }

      const upcoming = player.queue.slice(0, 3); // next 3 tracks

      const nowEmbed = new EmbedBuilder()
        .setColor(client.color)
        .setAuthor({
          name: `${message.guild.name} | Now Playing`,
          iconURL: message.guild.iconURL(),
        })
        .setDescription(
          `🎶 **Now Playing:**\n[${current.title}](${current.uri}) [${current.author}]\n\n` +
            (upcoming.length
              ? `📌 **Up Next:**\n${upcoming
                  .map(
                    (track, i) =>
                      `\`${i + 1}\` • [${track.title}](${track.uri}) [${track.author}]`
                  )
                  .join("\n")}`
              : "No songs in the queue.")
        )
        .setThumbnail(current.thumbnail || null) // ✅ song ka image right mein
        .setFooter({
          text: `Requested by ${message.author.username}`,
          iconURL: message.author.displayAvatarURL(),
        });

      return message.channel.send({ embeds: [nowEmbed] });
    } catch (error) {
      console.log(error);
      return message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(client.color)
            .setAuthor({ name: "Error" })
            .setDescription(
              "An unexpected error occurred while showing the current track."
            ),
        ],
      });
    }
  },
};
