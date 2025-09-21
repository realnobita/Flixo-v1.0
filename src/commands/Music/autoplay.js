const { Message, PermissionFlagsBits, EmbedBuilder } = require("discord.js");

module.exports = {
  name: "autoplay",
  aliases: ["ap"],
  description: `Play random songs.`,
  category: "Music",
  cooldown: 5,
  inVc: true,
  sameVc: true,
  voteOnly: false,
  premium: false,
  dj: true,
  run: async (client, message, args, prefix, player) => {
    try {
      const { channel } = message.member.voice;

      if (!player) {
        const embed = new EmbedBuilder()
          .setAuthor({
            name: "No Player Found For This Guild",
            iconURL: message.author.displayAvatarURL({ dynamic: true }),
          })
          .setColor(client.color);
        return message.channel.send({ embeds: [embed] });
      }

      if (player.data.get("autoplay")) {
        await player.data.set("autoplay", false);

        const embed = new EmbedBuilder()
          .setDescription("<:floovi_tick:1381965556277710860> | *Autoplay has been:* `Deactivated`")
          .setColor(client.color);
        return message.reply({ embeds: [embed] });
      } else {
        const identifier = player.queue.current.identifier;

        // Autoplay search logic start
        const platforms = [
          `https://open.spotify.com/track/${identifier}`,
          `https://www.deezer.com/track/${identifier}`,
          `https://soundcloud.com/track/${identifier}`,
          `https://www.youtube.com/watch?v=${identifier}&list=RD${identifier}`
        ];

        let found = false;
        let res = null;

        for (let i = 0; i < platforms.length; i++) {
          res = await player.search(platforms[i], { requester: message.user });

          if (res && res.tracks.length) {
            // Avoid same track
            const filteredTracks = res.tracks.filter(t => t.identifier !== identifier);
            if (filteredTracks.length) {
              res.tracks = filteredTracks;
              found = true;
              break;
            }
          }
        }

        if (!found || !res.tracks.length) {
          return message.reply("No valid related tracks found for autoplay.");
        }

        await player.data.set("autoplay", true);
        await player.data.set("requester", message.user);
        await player.data.set("identifier", identifier);
        await player.queue.add(res.tracks[0]);

        const embed = new EmbedBuilder()
          .setDescription("<:floovi_tick:1381965556277710860> | Autoplay has been: `Activated`")
          .setColor(client.color);

        return message.reply({ embeds: [embed] });
      }
    } catch (err) {
      console.log(err);
      const embed = new EmbedBuilder()
        .setAuthor({
          name: "No Player Found For This Guild",
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setFooter({
          text: `If You Want To Enable Autoplay Then Play Something You Like`,
          iconURL: message.guild.iconURL({ dynamic: true })
        })
        .setColor(client.color);

      return message.channel.send({ embeds: [embed] });
    }
  }
}