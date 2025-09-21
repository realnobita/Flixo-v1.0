const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

// 👇 Yaha apne Support Server ka Guild ID daalo
const BADGE_GUILD_ID = "1371496371147902986"; // example, apna actual ID daalna

const badgeMap = {
  "1408368580851929101": { emoji: "<:surya:1408368313880416297>", label: "Ɲ Ꭷ Ɓ ϟ Ƭ ꫝ ‹/›" },
  "1408360143594459207": { emoji: "<a:devloper:1341068119866867753>", label: "Developer" },
  "1418328906448109619": { emoji: "<:developers_assistant:1418329592095178893>", label: "Developer's Assistant" },
  "1408360145460924498": { emoji: "<a:own:1341068271536832549>", label: "Owner" },
  "1408360165014765649": { emoji: "<:owner:1341029563785936897>", label: "Co Owner" },
  "1383073624902209607": { emoji: "<:server:1415717200542830622>", label: "Server Contributer" },
  "1408361045352906793": { emoji: "<:Manager:1341063436813078580>", label: "Manager" },
  "1408360165786386552": { emoji: "<:admin:1408365969138778193>", label: "Admin" },
  "1408360622315278426": { emoji: "<:mod:1408365126435999764>", label: "Mod" },
  "1408360622940225689": { emoji: "<:H_HeartBeating:1372156285046362192>", label: "Trial Mod" },
  "1408361031201198090": { emoji: "<a:supporter:1341062737727459411>", label: "Supporter" },
  "1408360623439478855": { emoji: "<a:staff:1341062302245326939>", label: "Staff" },
  "1379820537995333682": { emoji: "<a:premium:1341063889973936221>", label: "Server Booster" },
  "1408360627927384094": { emoji: "<a:z_Friends:1408362483684479036>", label: "Owner's Friend" },
  "1408361435809058846": { emoji: "<a:nya_Love1:1393202294878900307>", label: "Vip" },
  "1408361311167057990": { emoji: "<a:flixo_Flower:1408356162323087410>", label: "Users ‹3" },
};

module.exports = {
  name: "profile",
  aliases: ["badges", "pr", "bdg"],
  description: "Show user profile with global badges",
  category: "Info",
  cooldown: 5,

  run: async (client, message, args) => {
    const targetUser = message.mentions.users.first() || message.author;

    const badgeGuild = client.guilds.cache.get(BADGE_GUILD_ID);
    if (!badgeGuild) {
      return message.reply({ content: "❌ You're not in the support server u must be in the support server to grant your badges." });
    }

    let member;
    try {
      member = await badgeGuild.members.fetch(targetUser.id);
    } catch {
      member = null;
    }

    // ✅ Roles check sirf support server ke
    let userBadges = [];
    let allBadges = "You Don't Have Badges Maybe You're not in the support server please join the support server given below.";

    if (member) {
      const badgeOrder = Object.keys(badgeMap);
      userBadges = badgeOrder
        .filter(roleId => member.roles.cache.has(roleId))
        .map(roleId => `${badgeMap[roleId].emoji} ${badgeMap[roleId].label}`);

      if (userBadges.length > 0) {
        allBadges = userBadges.join("\n");
      }
    }

    const embed = new EmbedBuilder()
      .setColor(client.color)
      .setAuthor({
        name: `${targetUser.username} - Profile`,
        iconURL: targetUser.displayAvatarURL({ dynamic: true })
      })
      .addFields({
        name: `<a:badges:1341064734572548147> Badges [${userBadges.length}]`,
        value: allBadges,
        inline: false
      })
      .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
      .setFooter({ text: `User ID: ${targetUser.id}` })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Support Server")
        .setStyle(ButtonStyle.Link)
        .setEmoji("<a:supporter:1341062737727459411>")
        .setURL("https://discord.gg/G4Uc7mwfwM"),
      new ButtonBuilder()
        .setLabel("Vote Me")
        .setStyle(ButtonStyle.Link)
        .setEmoji("<:discord:1395682373768581215>")
        .setURL("https://discord.ly/flixo")
    );

    return message.reply({ embeds: [embed], components: [row] });
  },
};