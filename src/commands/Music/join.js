const {
  EmbedBuilder,
  PermissionsBitField,
} = require("discord.js");

module.exports = {
  name: "join",
  aliases: ["j"],
  description: `Join the bot to your voice channel.`,
  category: "Music",
  cooldown: 5,
  inVc: true,
  sameVc: false, // handle kar rahe hai manually
  premium: false,
  dj: true,

  run: async (client, message, args, prefix, player) => {
    const userChannel = message.member.voice?.channel;
    if (!userChannel) {
      return message.reply({
        content: `You must be in a voice channel to use this command.`,
      });
    }

    const me = message.guild.members.me;
    const botChannel = me.voice?.channel;

    const missingPerms = [];
    if (!userChannel.permissionsFor(me).has(PermissionsBitField.Flags.ViewChannel))
      missingPerms.push("ViewChannel");
    if (!userChannel.permissionsFor(me).has(PermissionsBitField.Flags.Connect))
      missingPerms.push("Connect");
    if (!userChannel.permissionsFor(me).has(PermissionsBitField.Flags.Speak))
      missingPerms.push("Speak");

    if (missingPerms.length > 0) {
      return message.reply({
        content: `I don't have permissions: ${missingPerms.join(", ")} in your VC.`,
      });
    }

    if (botChannel) {
      if (botChannel.id === userChannel.id) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("#2f3136")
              .setDescription(`I'm already connected to **${botChannel.name}**.`),
          ],
        });
      } else {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("#2f3136")
              .setDescription(`I'm already connected to **${botChannel.name}**.`),
          ],
        });
      }
    }

    await client.manager.createPlayer({
      guildId: message.guild.id,
      textId: message.channel.id,
      voiceId: userChannel.id,
      volume: 100,
      deaf: true,
      shardId: message.guild.shardId,
    });

    return message.reply({
      embeds: [
        new EmbedBuilder()
          .setColor("#2f3136")
          .setDescription(`Joined **${userChannel.name}** successfully.`),
      ],
    });
  },
};