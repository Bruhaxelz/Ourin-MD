/**
 * @file plugins/group/antilink.js
 * @description Mengaktifkan / menonaktifkan Anti-Link grup WhatsApp (dengan Semi-Button)
 * @author Larskibidi
 * @version 1.0.0
 */

const { sendInteractiveMessage } = require('../../src/lib/message');

const pluginConfig = {
    name: 'antilink',
    alias: ['anti-link'],
    category: 'group',
    description: 'Aktifkan/nonaktifkan anti link grup WhatsApp',
    usage: '.antilink <on/off>',
    example: '.antilink on',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    isBotAdmin: false,
    cooldown: 3,
    limit: 0,
    isEnabled: true
};

async function handler(m, { sock, db, config: botConfig }) {
    const sub = (m.args[0] || '').toLowerCase();
    const botName = botConfig.bot?.name || 'KIR4LR';
    const devName = botConfig.bot?.developer || 'Larskibidi';

    if (!sub) {
        const groupData = db.getGroup(m.chat);
        const status = groupData?.antilink ? '✅ AKTIF' : '❌ NONAKTIF';
        const body =
            `🛡️ *ANTI-LINK GRUP*\n\n` +
            `Status saat ini: *${status}*\n\n` +
            `Jika aktif, pesan berisi link grup WA dari member biasa otomatis dihapus (pastikan bot jadi admin).\n\n` +
            `Gunakan:\n• \`${m.prefix}antilink on\`\n• \`${m.prefix}antilink off\``;

        try {
            await sendInteractiveMessage(sock, m.chat, {
                title: `🛡️ Pengaturan Anti-Link`,
                body,
                footer: `© ${botName} • by ${devName}`,
                buttons: [
                    {
                        name: 'quick_reply',
                        buttonParamsJson: JSON.stringify({
                            display_text: '✅ Aktifkan',
                            id: `${m.prefix}antilink on`
                        })
                    },
                    {
                        name: 'quick_reply',
                        buttonParamsJson: JSON.stringify({
                            display_text: '❌ Nonaktifkan',
                            id: `${m.prefix}antilink off`
                        })
                    }
                ]
            }, { quoted: m.raw });
        } catch {
            await m.reply(body);
        }
        return;
    }

    if (sub === 'on' || sub === 'aktif' || sub === '1') {
        db.setGroup(m.chat, { antilink: true, name: m.groupName });
        return m.reply('✅ *Anti-Link berhasil diaktifkan!*\nPastikan bot sudah dijadikan admin agar bisa menghapus link otomatis.');
    }

    if (sub === 'off' || sub === 'mati' || sub === '0') {
        db.setGroup(m.chat, { antilink: false, name: m.groupName });
        return m.reply('❌ *Anti-Link berhasil dinonaktifkan!*');
    }

    return m.reply(`❌ Gunakan \`${m.prefix}antilink on\` atau \`${m.prefix}antilink off\``);
}

module.exports = {
    config: pluginConfig,
    handler
};
