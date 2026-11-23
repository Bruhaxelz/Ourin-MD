/**
 * @file plugins/group/kick.js
 * @description Mengeluarkan member dari grup (khusus admin & bot admin)
 * @author Larskibidi
 * @version 1.0.0
 */

const pluginConfig = {
    name: 'kick',
    alias: ['tendang', 'remove'],
    category: 'group',
    description: 'Mengeluarkan member dari grup',
    usage: '.kick @tag (atau reply pesan)',
    example: '.kick @user',
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
        return m.reply(`👢 *Kick Member*\n\nTag atau reply pesan member yang ingin dikeluarkan:\n\`${m.prefix}kick @member\``);
    }

    if (target === m.botJid) {
        return m.reply('❌ Tidak bisa mengeluarkan bot sendiri!');
    }

    if (botConfig.isOwner(target)) {
        return m.reply('👑 Tidak bisa mengeluarkan Owner bot!');
    }

    try {
        await sock.groupParticipantsUpdate(m.chat, [target], 'remove');
        await sock.sendMessage(m.chat, {
            text: `✅ Berhasil mengeluarkan @${target.split('@')[0]} dari grup.`,
            mentions: [target]
        }, { quoted: m.raw });
    } catch (error) {
        await m.reply(`❌ Gagal mengeluarkan member: ${error.message}`);
    }
}

module.exports = {
    config: pluginConfig,
    handler
};
