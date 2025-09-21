const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  ComponentType,
  PermissionsBitField,
} = require("discord.js");
const IgnoreChannelSchema = require("../../models/IgnoreChannelSchema.js");

module.exports = {
  name: "ignorechannel",
  aliases: ["ignorechan", "ignorech", "ign", "ignore"],
  description: "Manage ignored channels.",
  cooldowns: 5,
  category: "Config",
  userPermissions: [PermissionsBitField.Flags.ManageGuild],
  botPermissions: [PermissionsBitField.Flags.ManageGuild],

  run: async (client, message, args) => {
    if (!args[0] || args[0] !== "channels") {
      const mainEmbed = new EmbedBuilder()
        .setColor(client.color)
        .setTitle("Ignore Setup")
        .setDescription(
          `<:floovi_tick:1381965556277710860> To ignore channels → \`${client.prefix}ignorechannel channels\``
        );
      return message.channel.send({ embeds: [mainEmbed] });
    }

    const allChannelsArray = Array.from(
      message.guild.channels.cache
        .filter(ch => ch.isTextBased() && ch.viewable)
        .sort((a, b) => a.rawPosition - b.rawPosition)
        .values()
    );

    const ignored = await IgnoreChannelSchema.find({ guildId: message.guild.id });
    const ignoredIds = ignored.map(c => c.channelId);

    const embed = new EmbedBuilder()
      .setColor(client.color)
      .setTitle("Ignore Channel Manager")
      .setDescription("Select the channels you want to ignore using the menu below.");

    const menu = new StringSelectMenuBuilder()
      .setCustomId("select_channels")
      .setPlaceholder("Select channels to toggle ignore")
      .setMinValues(1)
      .setMaxValues(25)
      .addOptions(
        allChannelsArray.slice(0, 25).map(ch => ({
          label: ch.name,
          value: ch.id,
          emoji: ignoredIds.includes(ch.id)
            ? { name: "floovi_tick", id: "1381965556277710860" }
            : { name: "floovi_cross", id: "1382029455601569904" }
        }))
      );

    const menuRow = new ActionRowBuilder().addComponents(menu);
    const confirmRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("confirm")
        .setLabel("Confirm")
        .setStyle(ButtonStyle.Success)
        .setEmoji("<:floovi_tick:1381965556277710860>"),
      new ButtonBuilder()
        .setCustomId("cancel")
        .setLabel("Cancel")
        .setStyle(ButtonStyle.Danger)
        .setEmoji("<:floovi_cross:1382029455601569904>")
    );

    const msg = await message.channel.send({
      embeds: [embed],
      components: [menuRow, confirmRow],
    });

    let selected = [];

    const menuCollector = msg.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 60_000,
    });

    menuCollector.on("collect", async s => {
      if (s.user.id !== message.author.id) return;
      selected = s.values;
    });

    const buttonCollector = msg.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 60_000,
    });

    buttonCollector.on("collect", async btn => {
      if (btn.user.id !== message.author.id) return;

      if (btn.customId === "confirm") {
        for (const chId of selected) {
          const exists = await IgnoreChannelSchema.findOne({ guildId: message.guild.id, channelId: chId });
          if (exists) {
            await IgnoreChannelSchema.deleteOne({ guildId: message.guild.id, channelId: chId });
          } else {
            await IgnoreChannelSchema.create({ guildId: message.guild.id, channelId: chId });
          }
        }

        const finalIgnored = await IgnoreChannelSchema.find({ guildId: message.guild.id });
        const finalList = finalIgnored.map(d => `<#${d.channelId}>`).join("\n") || "No channels are currently ignored.";

        const updatedEmbed = EmbedBuilder.from(msg.embeds[0])
          .setDescription(`**The channels ignored are:**\n${finalList}`);

        await btn.update({
          embeds: [updatedEmbed],
          components: [],
        });
      } else if (btn.customId === "cancel") {
        await btn.update({
          content: `<:floovi_cross:1382029455601569904> Cancelled.`,
          components: [],
        });
      }
    });
  },
};