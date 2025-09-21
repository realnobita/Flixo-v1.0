// ...rest of your imports and setup
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const updateQueue = require("../../handlers/setupQueue.js");

module.exports = {
  name: "play",
  aliases: ["p"],
  description: "Play a song or playlist",
  category: "Music",
  inVc: true,
  sameVc: true,
  dj: true,
  premium: false,

  run: async (client, message, args, prefix) => {
    const channel = message.member.voice.channel;
    const query = args.join(" ");

    if (!args[0]) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(client.color)
            .setTitle("Missing Query")
            .setDescription(`<:floovi_cross:1382029455601569904> | Please provide a song name, URL or playlist.`),
        ],
      });
    }

    const player = await client.manager.createPlayer({
      guildId: message.guild.id,
      textId: message.channel.id,
      voiceId: channel.id,
      volume: 80,
      deaf: true,
      shardId: message.guild.shardId,
    });

    const result = await client.manager.search(query, {
      requester: message.author,
    });

    if (!result.tracks.length) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(client.color)
            .setDescription(`<:floovi_cross:1382029455601569904> | No results found for **${query}**.`),
        ],
      });
    }

    if (result.type === "PLAYLIST") {
      result.tracks.forEach((track) => player.queue.add(track));
      if (!player.playing && !player.paused) player.play();

      const playlistEmbed = new EmbedBuilder()
        .setColor(client.color)
        .setTitle("Playlist Queued")
        .setDescription(
          `<:floovi_tick:1381965556277710860> | Added **${result.tracks.length}** songs from [${result.playlistName}](${query})`
        );

      await updateQueue(message.guild, player.queue);
      return message.reply({ embeds: [playlistEmbed] });
    }

    const track = result.tracks[0];
    player.queue.add(track);
    if (!player.playing && !player.paused) player.play();

    const trackEmbed = new EmbedBuilder()
      .setColor(client.color)
      .setTitle("Track Queued")
      .setDescription(
        `<:floovi_tick:1381965556277710860> | [${track.title}](${track.uri}) has been added to the queue.`
      )
      .setFooter({ text: `Requested by ${track.requester.tag}` });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("upcoming")
        .setLabel("Add as Upcoming")
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId("remove_song")
        .setLabel("Remove")
        .setStyle(ButtonStyle.Danger)
    );

    const showButtons = player.queue.length >= 2;
    const sent = await message.reply({
      embeds: [trackEmbed],
      components: showButtons ? [row] : [],
    });

    // ✅ Always enable collector if buttons are sent
    if (showButtons) {
      const collector = sent.createMessageComponentCollector({
        time: 10000,
        max: 1,
      });

      collector.on("collect", async (interaction) => {
        if (!interaction.isButton()) return;
        const lastTrack = player.queue[player.queue.length - 1];

        switch (interaction.customId) {
          case "remove_song":
            player.queue.pop();
            const removedEmbed = new EmbedBuilder()
              .setColor(client.color)
              .setDescription(`<:floovi_tick:1381965556277710860> | Track removed from queue.`);
            await interaction.update({ embeds: [removedEmbed], components: [] });
            break;

          case "upcoming":
            const upcomingTrack = player.queue.pop();
            player.queue.splice(0, 0, upcomingTrack); // Not index 0 else it plays immediately
            const upcomingEmbed = new EmbedBuilder()
              .setColor(client.color)
              .setDescription(`<:floovi_tick:1381965556277710860> | Track will play after the current one.`);
            await interaction.update({ embeds: [upcomingEmbed], components: [] });
            break;
        }
      });

      collector.on("end", async (_, reason) => {
        if (reason === "time") {
          await sent.edit({ components: [] }).catch(() => {});
        }
      });
    }

    await updateQueue(message.guild, player.queue);
  },
};