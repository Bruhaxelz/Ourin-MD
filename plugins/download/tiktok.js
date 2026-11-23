/**
 * @file plugins/download/tiktok.js
 * @description Download video / slide foto / audio MP3 TikTok tanpa watermark (GRATIS tanpa API key)
 * @author Larskibidi
 * @version 1.0.0
 */

const axios = require('axios');
const { sendInteractiveMessage } = require('../../src/lib/message');

const pluginConfig = {
    name: 'tiktok',
    alias: ['tt', 'ttdl', 'ttmp3', 'tiktokmp3'],
    category: 'download',
    description: 'Download video/foto/audio TikTok tanpa watermark',
    usage: '.tiktok <link_tiktok>',
    example: '.tiktok https://vt.tiktok.com/xxxxx',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    limit: 1,
    isEnabled: true
};

async function handler(m, { sock, config: botConfig }) {
    const url = m.args[0] || (m.quoted?.body || '').match(/https?:\/\/[^\s]*tiktok\.com[^\s]*/i)?.[0];
    const botName = botConfig.bot?.name || 'KIR4LR';
    const devName = botConfig.bot?.developer || 'Larskibidi';

    if (!url || !/tiktok\.com/i.test(url)) {
        return m.reply(
            `📥 *TikTok Downloader (${botName})*\n\n` +
            `Kirim link TikTok yang mau didownload!\n` +
            `• Video No-WM: \`${m.prefix}tiktok <link>\`\n` +
            `• Audio MP3: \`${m.prefix}ttmp3 <link>\``
        );
    }

    await m.react('⏳');

    try {
        const { data: res } = await axios.get('https://www.tikwm.com/api/', {
            params: { url, hd: 1 },
            timeout: 30000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        if (res?.code !== 0 || !res?.data) {
            throw new Error(res?.msg || 'Gagal mengambil data TikTok. Pastikan video tidak private.');
        }

        const data = res.data;
        const isAudioMode = m.command === 'ttmp3' || m.command === 'tiktokmp3' || m.args[1]?.toLowerCase() === 'audio';

        if (isAudioMode) {
            const audioUrl = data.music || data.music_info?.play;
            if (!audioUrl) throw new Error('Audio tidak tersedia untuk video ini.');

            const audioRes = await axios.get(audioUrl, { responseType: 'arraybuffer', timeout: 60000 });
            await sock.sendMessage(m.chat, {
                audio: Buffer.from(audioRes.data),
                mimetype: 'audio/mpeg',
                fileName: `${(data.title || 'tiktok_audio').slice(0, 40)}.mp3`
            }, { quoted: m.raw });

            await m.react('✅');
            return;
        }

        const caption =
            `📥 *TIKTOK DOWNLOADER*\n\n` +
            `👤 *Author:* ${data.author?.nickname || '-'} (@${data.author?.unique_id || '-'})\n` +
            `📝 *Judul:* ${(data.title || '-').slice(0, 200)}\n` +
            `❤️ ${data.digg_count || 0}  💬 ${data.comment_count || 0}  🔁 ${data.share_count || 0}\n\n` +
            `© *${botName}* • by *${devName}*`;

        // Jika konten berupa Photo Slideshow
        if (Array.isArray(data.images) && data.images.length > 0) {
            await m.reply(`🖼️ Mendeteksi *${data.images.length} slide foto*, sedang mengirim...`);
            for (let i = 0; i < Math.min(data.images.length, 10); i++) {
                await sock.sendMessage(m.chat, {
                    image: { url: data.images[i] },
                    caption: i === 0 ? caption : ''
                }, { quoted: i === 0 ? m.raw : undefined });
            }
        } else {
            const videoUrl = data.hdplay || data.play;
            if (!videoUrl) throw new Error('URL video tidak ditemukan.');

            const videoRes = await axios.get(videoUrl, { responseType: 'arraybuffer', timeout: 60000 });
            await sock.sendMessage(m.chat, {
                video: Buffer.from(videoRes.data),
                caption
            }, { quoted: m.raw });
        }

        // Kirim semi-button cepat untuk ambil MP3-nya
        if (data.music || data.music_info?.play) {
            try {
                await sendInteractiveMessage(sock, m.chat, {
                    body: 'Mau download *Audio MP3*-nya juga?',
                    footer: `© ${botName} • by ${devName}`,
                    buttons: [
                        {
                            name: 'quick_reply',
                            buttonParamsJson: JSON.stringify({
                                display_text: '🎵 Download MP3',
                                id: `${m.prefix}ttmp3 ${url}`
                            })
                        }
                    ]
                }, { quoted: m.raw });
            } catch {
                // Abaikan jika perangkat tidak mendukung tombol
            }
        }

        await m.react('✅');
    } catch (error) {
        await m.react('❌');
        await m.reply(`❌ *Gagal download TikTok!*\n\n_${error.message}_`);
    }
}

module.exports = {
    config: pluginConfig,
    handler
};
