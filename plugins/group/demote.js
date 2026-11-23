/**
 * @file plugins/group/demote.js
 * @description Menurunkan jabatan admin grup menjadi member biasa
 * @author Larskibidi
 * @version 1.0.0
 */

const pluginConfig = {
    name: 'demote',
    alias: ['unadmin', 'deladmin'],
    category: 'group',
    description: 'Menurunkan admin grup menjadi member biasa',
    usage: '.demote @tag (atau reply pesan)',
    example: '.demote @admin',
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

async function handler(m, { sock, config: botConfig }) {
    const target = m.mentionedJid?.[0] || m.quoted?.sender;
    if (!target) {
        return m.reply(`⬇️ *Demote Admin*\n\nTag atau reply pesan admin:\n\`${m.prefix}demote @admin\``);
    }

    if (botConfig.isOwner(target)) {
        return m.reply('👑 Tidak bisa demote Owner bot!');
    }

    try {
        await sock.groupParticipantsUpdate(m.chat, [target], 'demote');
        await sock.sendMessage(m.chat, {
            text: `⬇️ @${target.split('@')[0]} telah diturunkan menjadi *Member Biasa*.`,
            mentions: [target]
        }, { quoted: m.raw });
    } catch (error) {
        await m.reply(`❌ Gagal demote member: ${error.message}`);
    }
}

module.exports = {
    config: pluginConfig,
    handler
};
