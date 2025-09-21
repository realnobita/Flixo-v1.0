const client = require("../index");
const { EmbedBuilder } = require("discord.js");
const db = require("../models/SetupSchema");
const updateMessage = require("../handlers/setupQueue.js");

module.exports = async (client, track) => {
  client.manager.on("playerEnd", async (player) => {
    // âŒ No longer deleting the Now Playing / Queue embed
    await updateMessage(player, client, track);

    if (player.data.get("autoplay")) {
      const requester = player.data.get("requester");
      const identifier = player.data.get("identifier");
      // Fetch source from player data
let source = player?.data?.get("source");

// Validate the source
const validSources = ["spotify", "soundcloud", "deezer","youtube"];

// If source is missing or invalid, default to youtube
if (!validSources.includes(source)) {
    source = "youtube";
}

      let search;

      switch (source) {

  case "spotify":
    search = `https://open.spotify.com/track/${identifier}`;
    break;

  case "soundcloud":
    search = `https://soundcloud.com/${identifier}`;
    break;
 case "deezer":
    search = `https://www.deezer.com/track/${identifier}`;
    break;
case "youtube":
   search = `https://www.youtube.com/watch?v=${identifier}&list=RD${identifier}`;
   break;
              
  default:
    search = null;
    break;
}
          const title = player.currentTrack?.title || "unknown";
          const author = player.currentTrack?.author || "";
          async function universalSearch(title, author) {

  // 2. Spotify
  result = await kazagumo.search(`spsearch:${title} ${author}`);
  if (result?.tracks?.length) return result;

  // 3. SoundCloud
  result = await kazagumo.search(`scsearch:${title} ${author}`);
  if (result?.tracks?.length) return result;

  // 5. Deezer
  result = await kazagumo.search(`dzsearch:${title} ${author}`);
  if (result?.tracks?.length) return result;
              
  // 1. YouTube
  let result = await kazagumo.search(`ytsearch:${title} ${author}`);
  if (result?.tracks?.length) return result;

  return null;
      }

      const res = await player.search(search, { requester });

      if (!res || !res.tracks || !res.tracks.length) return;

      const nextTrack = res.tracks[Math.floor(Math.random() * res.tracks.length)];
      await player.queue.add(nextTrack);
    }
  });

  client.manager.on("playerEmpty", async (player) => {
    // âŒ No longer deleting the Now Playing / Queue embed
    await updateMessage(player, client, track);

const embed = new EmbedBuilder()
  .setAuthor({
    name: "Floovi Music â€” Queue Finished",
    iconURL: client.user.displayAvatarURL(),
  })
  .setColor(client.color)
  .setDescription(
    `The music queue has now reached its end.\n\n` +
    `Thank you for vibing with **Floovi**. We hope you had a great listening experience with high-quality uninterrupted music.\n\n` +
    `You can always invite Floovi to more servers or join our support server to stay updated with future improvements and exclusive features.\n\n` +
    `â€¢ [Invite Floovi](https://discord.com/oauth2/authorize?client_id=1340602825566195834)\n` +
    `â€¢ [Join Support Server](https://discord.gg/floovi)`
  )
  .setFooter({
    text: "Floovi â€” By Floovi Developement </>",
    iconURL: client.user.displayAvatarURL(),
  })
  .setImage("https://media.discordapp.net/attachments/1369713527106830357/1383063284881555466/file_000000004ebc61f592de610b511056f5.png");

    const data = await db.findOne({ guildId: player.guildId });
    if (data && data.channelId === player.textId) return;

    const msg = await client.channels.cache
      .get(player.textId)
      ?.send({ embeds: [embed] })
      .catch(() => null);

    if (msg) {
      player.data.set("message", msg);

      setTimeout(async () => {
        if (msg.deletable) {
          try {
            await msg.delete().catch(() => {});
          } catch {}
        }
      }, 10000); // â± 20 seconds
    }
  });

  client.manager.on("playerMoved", async (player) => {
    // Try deleting the Now Playing embed first
    const guild = client.guilds.cache.get(player.guildId);
    const channel = guild.channels.cache.get(player.textId);
    const messageId = player.data.get("message"); // assuming you stored embed message ID here

    if (channel && messageId) {
        try {
            const message = await channel.messages.fetch(messageId);
            if (message) {
                await message.delete();
            }
        } catch (err) {
            console.log(`Failed to delete Now Playing message: ${err}`);
        }
    }

    // Now destroy the player after deleting the embed
    player.destroy();
});
};