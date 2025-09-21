const Badge = require("../../models/BadgeSchema"); // Adjust path as needed

const badgeEmojiMap = {
    "Owner": "<:owner:1341029563785936897>",
    "Developer": "<:Developer:1341029897501413406>",
    "Co-Developer": "<:dev:1341061043140689951>",
    "Admim": "<:admin:1341061166171947051>",
    "Supporter": "<a:supporter:1341062737727459411>",
    "Mod": "<:Mod:1341061919011897367>",
    "Staff": "<a:staff:1341062302245326939>",
    "Team": "<:team:1341062231801991179>",
    "Vip": "<:Vips:1341029976681484350>",
    "Friend": "<:hearts-1:1341063993208344598>",
    "Bughunter": "<:Bughunter2:1341063128234070106>",
    "Manager": "<:Manager:1341063436813078580>",
    "Special": "<:heart3:1341063564223582251>",
    "Premuser": "<a:premium:1341063889973936221>",
    "User": "<a:User:1341064636623093780>"
};

module.exports = {
    name: "add-badge",
    description: "Add a badge to a user",
    category: "Badges",
    ownerOnly: true, // Only authorized users can use this command
    run: async (client, message, args) => {
        const member = message.mentions.users.first();
        const badge = args[1];

        if (!member || !badge) {
            return message.channel.send(`${client.emoji.cross} | Please mention a user and specify a badge.`);
        }

        const badgeList = Object.keys(badgeEmojiMap);

        if (!badgeList.includes(badge)) {
            return message.channel.send(`Invalid badge. Available badges: ${badgeList.join(", ")}`);
        }

        let userBadges = await Badge.findOne({ userId: member.id });

        const emojiBadge = `${badgeEmojiMap[badge]}・${badge}`;

        if (!userBadges) {
            userBadges = new Badge({ userId: member.id, badges: [emojiBadge] });
        } else if (userBadges.badges.includes(emojiBadge)) {
            return message.channel.send(`${client.emoji.cross} | User already has this badge.`);
        } else {
            userBadges.badges.push(emojiBadge);
        }

        await userBadges.save();
        return message.channel.send(`${client.emoji.tick} | Badge **${emojiBadge}** has been added to **${member.tag}**.`);
    }
};
