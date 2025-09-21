const { EmbedBuilder } = require("discord.js");

module.exports = async (client) => {
  const cleanNowPlaying = async (player) => {
    try {
      const nowPlayingMessage = player.data.get("nplaying");
      if (nowPlayingMessage) {
        const channel = client.channels.cache.get(nowPlayingMessage.channelId);
        if (!channel) return;

        const message = await channel.messages.fetch(nowPlayingMessage.id).catch(() => null);
        if (message && message.deletable) {
          await message.delete().catch(() => {});
        }

        player.data.delete("nplaying");
      }
    } catch (_) {}
  };

  client.manager.on("playerEnd", cleanNowPlaying);
  client.manager.on("playerDestroy", cleanNowPlaying);
};