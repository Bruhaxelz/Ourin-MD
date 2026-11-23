/**
 * @file plugins/utility/toimg.js
 * @description Konversi sticker WebP menjadi gambar PNG
 * @author Larskibidi
 * @version 1.0.0
 */

const sharp = require('sharp');

const pluginConfig = {
    name: 'toimg',
    alias: ['toimage', 'stiker2img', 's2img'],
    category: 'utility',
    description: 'Mengubah sticker menjadi gambar PNG',
    usage: '.toimg (reply sticker)',
    example: '.toimg',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    limit: 1,
    isEnabled: true
};

async function handler(m, { sock, config: botConfig }) {
    const isQuotedSticker = m.quoted && m.quoted.type === 'stickerMessage';
    if (!isQuotedSticker) {
        return m.reply(`🖼️ *Sticker to Image*\n\nReply sticker yang mau diubah ke gambar dengan ketik:\n\`${m.prefix}toimg\``);
    }

    await m.react('⏳');

    try {
        const buffer = await m.quoted.download();
        if (!buffer) throw new Error('Gagal mengunduh sticker!');

        const pngBuffer = await sharp(buffer).png().toBuffer();

        await sock.sendMessage(m.chat, {
            image: pngBuffer,
            caption: `✅ Berhasil diubah ke gambar!\n© *${botConfig.bot?.name || 'KIR4LR'}*`
        }, { quoted: m.raw });

        await m.react('✅');
    } catch (error) {
        await m.react('❌');
        await m.reply(`❌ Gagal mengubah sticker ke gambar!\n_${error.message}_`);
    }
}

module.exports = {
    config: pluginConfig,
    handler
};
