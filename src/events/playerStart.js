const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const setplayer = require("../models/SetupPlayerSchema.js");
const setup = require("../models/SetupSchema.js");
const updateMessage = require("../handlers/setupQueue.js");

module.exports = async (client) => {
    client.manager.on("playerStart", async (player, track) => {
        try {
            const playerConfig = await setplayer.findOne({ guildId: player.guildId });
            const mode = playerConfig?.playerMode || 'classic';
            const updateData = await setup.findOne({ guildId: player.guildId });

            await updateMessage(player, client, track);

            if (updateData && updateData.channelId == player.textId) return;

            player.previousTrack = player.currentTrack || null;
            player.currentTrack = track;

            if (mode === "classic") {
                const messageChannel = client.channels.cache.get(player.textId);
                if (!messageChannel) return;

                const embed = buildEmbed(track, client, player, messageChannel.guild);
                const components = getPlayerButtons(player);
                const nplaying = await messageChannel.send({ embeds: [embed], components }).catch(console.error);
                if (!nplaying) return;

                player.data.set("nplaying", nplaying);

                const filter = (i) =>
                    i.guild.members.me.voice.channel &&
                    i.guild.members.me.voice.channelId === i.member.voice.channelId;
                const collector = nplaying.createMessageComponentCollector({ filter, time: 3600000 });

                collector.on("collect", async (interaction) => {
                    const id = interaction.customId;
                    let feedbackMessage;
                    await interaction.deferUpdate();

                    switch (id) {
                        case "pause":
                            await player.pause(!player.paused);
                            feedbackMessage = `The track has been successfully ${player.paused ? "paused" : "resumed"}.`;
                            break;
                        case "skip":
                            if (player.queue.size > 0) {
                                await player.skip();
                                feedbackMessage = `Skipped to the next track in the queue.`;
                            } else {
                                await player.destroy();
                                feedbackMessage = `No more tracks in queue. Stopping playback.`;
                            }
                            break;
                        case "back":
                            const previous = player.previousTrack;
                            if (previous) {
                                await player.play(previous);
                                feedbackMessage = `Playing previous track.`;
                            } else {
                                feedbackMessage = `No previous track available.`;
                            }
                            break;
                        case "shuffle":
                            player.queue.shuffle();
                            feedbackMessage = `Queue has been shuffled.`;
                            break;
                        case "loop":
                            const newLoop = player.loop === "track" ? "none" : "track";
                            await player.setLoop(newLoop);
                            feedbackMessage = `Loop mode has been ${newLoop === "track" ? "enabled" : "disabled"}.`;
                            break;
                    }

                    if (feedbackMessage) {
                        const feedback = await interaction.channel.send({
                            embeds: [
                                new EmbedBuilder()
                                    .setDescription(feedbackMessage)
                                    .setColor(client.color)
                                    .setFooter({ text: `Executed by ${interaction.user.tag}` }),
                            ],
                        });
                        setTimeout(() => feedback.delete().catch(() => { }), 5000);
                    }

                    await nplaying.edit({ components: getPlayerButtons(player) }).catch(() => { });
                });

                collector.on("end", async (_, reason) => {
                    if (reason === "time") {
                        const disabledComponents = getPlayerButtons(player, true);
                        await nplaying.edit({ components: disabledComponents }).catch(() => { });
                    }
                });
            }
        } catch (e) {
            console.error("playerStart error:", e);
        }
    });
};

function buildEmbed(track, client, player, guild) {
    const duration = formatMs(track.length);

    const platformEmojis = {
        youtube: "<:ytm:1382661482516320348>",
        spotify: "<:spotify:1382662749527740596>",
        soundcloud: "<:soundcloud:1382661331454398567>",
        applemusic: "<:applemusic:1382661554675384330>",
        deezer: "<:Deezer:1382661703224791052>",
        default: "<:music:1341030939135836294>"
    };

    const source = track.sourceName?.toLowerCase() || "default";
    const platformText = platformEmojis[source] || platformEmojis["default"];

    return new EmbedBuilder()
        .setDescription(`${platformText} **Now Playing**\n\`Name:${track.title}\`\n\`Duration: ${duration}\``)
        .setThumbnail(track.thumbnail || null)
        .setColor(client.color)
        .setFooter({
            text: `Requested by ${track.requester?.tag || "Floovi"}`,
            iconURL: guild.iconURL({ dynamic: true }) || client.user.displayAvatarURL(),
        });
}

function getPlayerButtons(player, disabled = false) {
    return [
        new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("loop")
                .setEmoji("<:loop:1382664510019735553>")
                .setStyle(player.loop === "track" ? ButtonStyle.Success : ButtonStyle.Secondary)
                .setDisabled(disabled),
            new ButtonBuilder()
                .setCustomId("back")
                .setEmoji("<:Back:1382664275012620300>")
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(disabled),
            new ButtonBuilder()
                .setCustomId("pause")
                .setEmoji(player.paused ? "<:resume:1382664368994648126>" : "<:Pause:1382664369975853116>")
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(disabled),
            new ButtonBuilder()
                .setCustomId("skip")
                .setEmoji("<:forward:1382664277839577189>")
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(disabled),
            new ButtonBuilder()
                .setCustomId("shuffle")
                .setEmoji("<:shuffle:1384497021477589042>")
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(disabled),
        ),
    ];
}

function formatMs(ms) {
    const s = Math.floor(ms / 1000);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return h > 0
        ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
        : `${m}:${String(sec).padStart(2, '0')}`;
}