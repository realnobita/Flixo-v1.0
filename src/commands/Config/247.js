const {
  PermissionFlagsBits,
  PermissionsBitField,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} = require("discord.js");
const reconnectAuto = require("../../models/reconnect.js");

module.exports = {
  name: "24/7",
  aliases: ["247", "tfs", "wentyfourseven"],
  description: "Toggle 24/7 mode in your voice channel",
  userPermissions: PermissionFlagsBits.ManageGuild,
  botPermissions: PermissionFlagsBits.Speak,
  cooldowns: 5,
  category: "Config",
  inVc: true,
  sameVc: true,
  voteOnly: false,
  premium: false,

  run: async (client, message, args) => {
    const tick = "<:floovi_tick:1381965556277710860>";
    const cross = "<:floovi_cross:1382029455601569904>";

    const voiceChannel = message.member.voice.channel;
    const botPerms = voiceChannel.permissionsFor(message.guild.members.me);

    if (!botPerms.has(PermissionsBitField.Flags.ViewChannel))
      return message.reply(`${cross} | I need **View Channel** permission in your voice channel.`);

    if (!botPerms.has(PermissionsBitField.Flags.Connect))
      return message.reply(`${cross} | I need **Connect** permission in your voice channel.`);

    if (!botPerms.has(PermissionsBitField.Flags.Speak))
      return message.reply(`${cross} | I need **Speak** permission in your voice channel.`);

    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageGuild))
      return message.reply(`${cross} | You must have **Manage Server** permission to toggle 24/7 mode.`);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("enable_247")
        .setLabel("Enable")
        .setStyle(ButtonStyle.Success)
        .setEmoji(tick),

      new ButtonBuilder()
        .setCustomId("disable_247")
        .setLabel("Disable")
        .setStyle(ButtonStyle.Danger)
        .setEmoji(cross)
    );

    const msg = await message.channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor(client.color)
          .setDescription(`**Select what you want to do with 24/7 mode in \`${voiceChannel.name}\`:**`)
      ],
      components: [row],
    });

    const collector = msg.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 15000,
      max: 1,
    });

    collector.on("collect", async (interaction) => {
      if (interaction.user.id !== message.author.id) {
        return interaction.reply({ content: `${cross} | Only the person who used the command can interact.`, ephemeral: true });
      }

      const data = await reconnectAuto.findOne({ GuildId: message.guild.id });

      if (interaction.customId === "enable_247") {
        if (data) {
          return interaction.update({
            embeds: [
              new EmbedBuilder()
                .setColor(client.color)
                .setDescription(`${cross} | 24/7 mode is already **enabled** in this server.`)
            ],
            components: []
          });
        }

        await reconnectAuto.create({
          GuildId: message.guild.id,
          TextId: message.channel.id,
          VoiceId: voiceChannel.id,
        });

        await client.manager.createPlayer({
          guildId: message.guild.id,
          textId: message.channel.id,
          voiceId: voiceChannel.id,
          volume: 100,
          deaf: true,
          shardId: message.guild.shardId,
        });

        return interaction.update({
          embeds: [
            new EmbedBuilder()
              .setColor(client.color)
              .setDescription(`${tick} | 24/7 mode has been **enabled** in \`${voiceChannel.name}\`.`)
          ],
          components: [] // buttons hidden
        });
      }

      if (interaction.customId === "disable_247") {
        if (!data) {
          return interaction.update({
            embeds: [
              new EmbedBuilder()
                .setColor(client.color)
                .setDescription(`${cross} | 24/7 mode is already **disabled** in this server.`)
            ],
            components: []
          });
        }

        await reconnectAuto.findOneAndDelete({ GuildId: message.guild.id });

        return interaction.update({
          embeds: [
            new EmbedBuilder()
              .setColor(client.color)
              .setDescription(`${tick} | 24/7 mode has been **disabled** in \`${voiceChannel.name}\`.`)
          ],
          components: [] // buttons hidden
        });
      }
    });

    collector.on("end", async (collected) => {
      if (collected.size === 0) {
        await msg.edit({
          embeds: [
            new EmbedBuilder()
              .setColor(client.color)
              .setDescription(`${cross} | You didn't choose any option in time. 24/7 setup session ended.`)
          ],
          components: [] // remove buttons on timeout too
        });
      }
    });
  },
};