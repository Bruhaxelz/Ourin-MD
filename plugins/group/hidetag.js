/**
 * @file plugins/group/hidetag.js
 * @description Tag semua member grup secara tersembunyi (khusus admin)
 * @author Larskibidi
 * @version 1.0.0
 */

const pluginConfig = {
    name: 'hidetag',
    alias: ['h', 'totag', 'pengumuman'],
    category: 'group',
    description: 'Tag semua member grup tanpa menampilkan daftar @mention',
    usage: '.hidetag <pesan>',
    example: '.hidetag Halo semua, ada pengumuman!',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    isBotAdmin: false,
    cooldown: 5,
    limit: 0,
    isEnabled: true
};

async function handler(m, { sock }) {
    const text = m.fullArgs || m.quoted?.body || '';
    if (!text) {
        return m.reply(`📢 *Hidetag*\n\nKirim teks atau reply pesan dengan:\n\`${m.prefix}hidetag <pesan>\``);
    }

    const participants = m.groupMembers.map(p => p.id).filter(Boolean);

    await sock.sendMessage(m.chat, {
        text,
        mentions: participants
    });
}

module.exports = {
    config: pluginConfig,
    handler
};
