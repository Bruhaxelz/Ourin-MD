/**
 * @file plugins/group/promote.js
 * @description Menjadikan member sebagai admin grup
 * @author Larskibidi
 * @version 1.0.0
 */

const pluginConfig = {
    name: 'promote',
    alias: ['admin', 'addadmin'],
    category: 'group',
    description: 'Menjadikan member sebagai admin grup',
    usage: '.promote @tag (atau reply pesan)',
    example: '.promote @user',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    isBotAdmin: true,
    cooldown: 3,
    limit: 0,
    isEnabled: true
};

async function handler(m, { sock }) {
    const target = m.mentionedJid?.[0] || m.quoted?.sender;
    if (!target) {
        return m.reply(`⬆️ *Promote Admin*\n\nTag atau reply pesan member:\n\`${m.prefix}promote @member\``);
    }

    try {
        await sock.groupParticipantsUpdate(m.chat, [target], 'promote');
        await sock.sendMessage(m.chat, {
            text: `👑 @${target.split('@')[0]} sekarang menjadi *Admin Grup*!`,
            mentions: [target]
        }, { quoted: m.raw });
    } catch (error) {
        await m.reply(`❌ Gagal promote member: ${error.message}`);
    }
}

module.exports = {
    config: pluginConfig,
    handler
};
