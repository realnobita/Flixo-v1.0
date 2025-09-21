const { white, green, red } = require("chalk");
const { ActivityType } = require("discord.js");
const reconnectAuto = require("../models/reconnect.js");
const wait = require("wait");
const { AutoPoster } = require("topgg-autoposter");

module.exports = async (client) => {
  client.on("ready", async () => {

    // Initialize TopGG AutoPoster
    try {
      if (client.config.topgg_Api) {
        const poster = AutoPoster(client.config.topgg_Api, client);
        poster.on("posted", (stats) => {
          console.log(`${green("[TOPGG]")} Posted stats | Servers: ${stats.serverCount}`);
        });
      } else {
        console.log(`${red("[WARN]")} Top.gg API key not provided. Skipping AutoPoster.`);
      }
    } catch (error) {
      console.log(`${red("[ERROR]")} Top.gg autoposter failed:`, error);
    }

    // Auto reconnect queue system
    await wait(15000);
    let maindata;
    try {
      maindata = await reconnectAuto.find();
    } catch (err) {
      console.error(`${red("[ERROR]")} Failed to load reconnect data:`, err);
      maindata = [];
    }

    console.log(
      `${green("[RECONNECT]")} Found ${maindata.length} reconnect queue(s). Resuming...`
    );

    for (const data of maindata) {
      try {
        const text = await client.channels.fetch(data.TextId).catch(() => null);
        const guild = await client.guilds.fetch(data.GuildId).catch(() => null);
        const voice = await client.channels.fetch(data.VoiceId).catch(() => null);
        if (!guild || !text || !voice) continue;

        await client.manager.createPlayer({
          guildId: guild.id,
          textId: text.id,
          voiceId: voice.id,
          volume: 100,
          deaf: true,
          shardId: guild.shardId,
        });

        console.log(`${green("[JOINED]")} ${guild.name}`);
      } catch (error) {
        console.error(`${red("[FAILED]")} Guild ${data.GuildId}: ${error.message}`);
      }
    }

    console.log(
      `${green("[INFO]")} ${client.user.username} (${client.user.id}) is fully Ready!`
    );

    // Presence Rotation System
    const activities = [
      { name: "Floovi Is Love <3", type: ActivityType.Playing },
      { name: `${client.config.prefix}help`, type: ActivityType.Playing },
      { name: `${client.config.prefix}play`, type: ActivityType.Playing },
    ];

    const statuses = ["idle", "idle", "idle"];
    let activityIndex = 0;
    let statusIndex = 0;

    setInterval(async () => {
      try {
        await client.user.setPresence({
          activities: [activities[activityIndex]],
          status: statuses[statusIndex],
        });

        activityIndex = (activityIndex + 1) % activities.length;
        statusIndex = (statusIndex + 1) % statuses.length;
      } catch (err) {
        console.error(`${red("[Presence Error]")}`, err);
      }
    }, 10000);
  });
};