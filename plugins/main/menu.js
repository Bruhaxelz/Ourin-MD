/**
 * @file plugins/main/menu.js
 * @description Plugin menu utama KIR4LR dengan Semi-Button Interactive UI (single_select + quick_reply)
 * @author Larskibidi
 * @version 7.0.0
 */

const { formatUptime, getTimeGreeting } = require('../../src/lib/formatter');
const { getCommandsByCategory, getCategories, getPluginsByCategory } = require('../../src/lib/plugins');
const { sendInteractiveMessage } = require('../../src/lib/message');
const fs = require('fs');
const path = require('path');

const pluginConfig = {
    name: 'menu',
    alias: ['help', 'bantuan', 'commands', 'm', 'allmenu'],
    category: 'main',
    description: 'Menampilkan menu utama bot dengan Semi-Button interaktif',
    usage: '.menu [kategori/all]',
    example: '.menu',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    limit: 0,
    isEnabled: true
};

const CATEGORY_EMOJIS = {
    owner: '👑',
    main: '🏠',
    utility: '🔧',
    fun: '🎮',
    group: '👥',
    download: '📥',
    search: '🔍',
    tools: '🛠️',
    sticker: '🖼️',
    ai: '🤖',
    game: '🎯',
    media: '🎬',
    info: 'ℹ️'
};

const CATEGORY_ORDER = ['main', 'download', 'utility', 'group', 'search', 'fun', 'tools', 'sticker', 'media', 'ai', 'game', 'info', 'owner'];

function formatTime(date) {
    return date.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
}

function formatDateShort(date) {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function getSortedCategories(isOwner) {
    const categories = getCategories().filter(cat => !(cat === 'owner' && !isOwner));
    return categories.sort((a, b) => {
        const indexA = CATEGORY_ORDER.indexOf(a);
        const indexB = CATEGORY_ORDER.indexOf(b);
        return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
    });
}

async function handler(m, { sock, config: botConfig, db, uptime }) {
    const prefix = botConfig.command?.prefix || '.';
    const botName = botConfig.bot?.name || 'KIR4LR';
    const devName = botConfig.bot?.developer || 'Larskibidi';
    const botVer = botConfig.bot?.version || '1.2.0';

    const user = db.getUser(m.sender);
    const now = new Date();
    const timeStr = formatTime(now);
    const dateStr = formatDateShort(now);

    const sortedCategories = getSortedCategories(m.isOwner);
    const commandsByCategory = getCommandsByCategory();

    let totalCommands = 0;
    for (const category of sortedCategories) {
        totalCommands += (commandsByCategory[category] || []).length;
    }

    let userRole = 'User';
    let roleEmoji = '👤';
    if (m.isOwner) {
        userRole = 'Owner';
        roleEmoji = '👑';
    } else if (m.isPremium) {
        userRole = 'Premium';
        roleEmoji = '💎';
    }

    const greeting = getTimeGreeting();
    const uptimeFormatted = formatUptime(uptime);
    const totalUsers = db.getUserCount();
    const arg = (m.command === 'allmenu' ? 'all' : (m.args[0] || '')).toLowerCase();

    const imagePath = path.join(process.cwd(), 'assets', 'images', 'kir4lr.jpg');
    const hasImage = fs.existsSync(imagePath);

    // 1. Jika user memilih kategori tertentu via semi-button atau ketik `.menu <kategori>`
    if (arg && arg !== 'all' && sortedCategories.includes(arg)) {
        const emoji = CATEGORY_EMOJIS[arg] || '📋';
        const plugins = getPluginsByCategory(arg).filter(p => p.config.isEnabled);

        let catText = `╭┈┈⽗「 ${emoji} *MENU ${arg.toUpperCase()}* 」\n`;
        for (const p of plugins) {
            catText += `││ ރ *${prefix}${p.config.name}*\n`;
            if (p.config.description) {
                catText += `││    _${p.config.description}_\n`;
            }
        }
        catText += `╰┈┈┈┈┈┈┈┈⽗\n\n`;
        catText += `💡 Ketik perintah sesuai daftar di atas.\n`;
        catText += `© *${botName}* | Created by *${devName}*`;

        try {
            await sendInteractiveMessage(sock, m.chat, {
                title: `${emoji} ${botName} — ${arg.toUpperCase()}`,
                body: catText,
                footer: `© ${botName} • by ${devName}`,
                buttons: [
                    {
                        name: 'quick_reply',
                        buttonParamsJson: JSON.stringify({
                            display_text: '📋 Menu Utama',
                            id: `${prefix}menu`
                        })
                    },
                    {
                        name: 'quick_reply',
                        buttonParamsJson: JSON.stringify({
                            display_text: '📜 Semua Fitur',
                            id: `${prefix}menu all`
                        })
                    }
                ]
            }, { quoted: m.raw, mentions: [m.sender] });
        } catch {
            await sendFallbackUI(m, sock, catText, botConfig);
        }
        return;
    }

    // Build header info
    let headerText = '';
    headerText += `Hallo *${m.pushName}* ${greeting.includes('pagi') ? '🌅' : greeting.includes('siang') ? '☀️' : greeting.includes('sore') ? '🌇' : '🌙'}\n`;
    headerText += `${greeting}! Selamat datang di *${botName}*\n\n`;

    headerText += `╭┈┈⽗「 🤖 *BOT INFO* 」\n`;
    headerText += `││ ރ Nama: *${botName}*\n`;
    headerText += `││ ރ Versi: *v${botVer}*\n`;
    headerText += `││ ރ Developer: *${devName}*\n`;
    headerText += `││ ރ Mode: *${(botConfig.mode || 'public').toUpperCase()}*\n`;
    headerText += `││ ރ Prefix: *[ ${prefix} ]*\n`;
    headerText += `││ ރ Uptime: *${uptimeFormatted}*\n`;
    headerText += `││ ރ Total User: *${totalUsers}*\n`;
    headerText += `││ ރ Total Fitur: *${totalCommands}*\n`;
    headerText += `╰┈┈┈┈┈┈┈┈⽗\n\n`;

    headerText += `╭┈┈⽗「 👤 *USER INFO* 」\n`;
    headerText += `││ ރ Nama: *${m.pushName}*\n`;
    headerText += `││ ރ Role: *${roleEmoji} ${userRole}*\n`;
    headerText += `││ ރ Limit: *${m.isOwner ? 'Unlimited' : (user?.limit ?? 25)}*\n`;
    headerText += `││ ރ Waktu: *${timeStr} WIB*\n`;
    headerText += `││ ރ Tanggal: *${dateStr}*\n`;
    headerText += `╰┈┈┈┈┈┈┈┈⽗\n\n`;

    // Build full command list (untuk `.menu all` dan fallback)
    let allListText = headerText;
    for (const category of sortedCategories) {
        const commands = commandsByCategory[category] || [];
        if (commands.length === 0) continue;

        const emoji = CATEGORY_EMOJIS[category] || '📋';
        allListText += `╭┈┈⽗「 ${emoji} \`${category.toUpperCase()}\` 」\n`;
        for (const cmd of commands) {
            allListText += `││ ރ ${prefix}${cmd}\n`;
        }
        allListText += `╰┈┈┈┈┈┈┈┈⽗\n\n`;
    }
    allListText += `© *${botName}* | ${new Date().getFullYear()}\n`;
    allListText += `Developer: *${devName}*`;

    // 2. Jika `.menu all` -> kirim daftar lengkap + tombol cepat
    if (arg === 'all') {
        try {
            await sendInteractiveMessage(sock, m.chat, {
                title: `📜 ALL MENU — ${botName}`,
                body: allListText,
                footer: `© ${botName} • by ${devName}`,
                image: hasImage ? imagePath : null,
                buttons: [
                    {
                        name: 'quick_reply',
                        buttonParamsJson: JSON.stringify({
                            display_text: '📋 Menu Kategori',
                            id: `${prefix}menu`
                        })
                    },
                    {
                        name: 'quick_reply',
                        buttonParamsJson: JSON.stringify({
                            display_text: '⚡ Ping',
                            id: `${prefix}ping`
                        })
                    },
                    {
                        name: 'quick_reply',
                        buttonParamsJson: JSON.stringify({
                            display_text: '👑 Owner',
                            id: `${prefix}owner`
                        })
                    }
                ]
            }, { quoted: m.raw, mentions: [m.sender] });
        } catch {
            await sendFallbackUI(m, sock, allListText, botConfig);
        }
        return;
    }

    // 3. Default `.menu` -> SEMI-BUTTON INTERACTIVE MENU (List Kategori + Quick Reply)
    const rows = [
        {
            header: 'SEMUA FITUR',
            title: '📜 All Menu',
            description: `Tampilkan seluruh ${totalCommands} command sekaligus`,
            id: `${prefix}menu all`
        }
    ];

    for (const category of sortedCategories) {
        const commands = commandsByCategory[category] || [];
        if (commands.length === 0) continue;
        const emoji = CATEGORY_EMOJIS[category] || '📋';
        rows.push({
            header: category.toUpperCase(),
            title: `${emoji} Menu ${category.charAt(0).toUpperCase() + category.slice(1)}`,
            description: `${commands.length} fitur: ${commands.slice(0, 4).map(c => prefix + c).join(', ')}${commands.length > 4 ? '...' : ''}`,
            id: `${prefix}menu ${category}`
        });
    }

    let semiBody = headerText;
    semiBody += `📌 *Pilih kategori fitur di tombol bawah*, atau ketik \`${prefix}menu all\` untuk melihat semua perintah.`;

    try {
        await sendInteractiveMessage(sock, m.chat, {
            title: `✨ ${botName} MENU`,
            subtitle: `Created by ${devName}`,
            body: semiBody,
            footer: `© ${botName} | Created by ${devName}`,
            image: hasImage ? imagePath : null,
            buttons: [
                {
                    name: 'single_select',
                    buttonParamsJson: JSON.stringify({
                        title: '📋 Pilih Menu',
                        sections: [
                            {
                                title: `Kategori Fitur ${botName}`,
                                highlight_label: 'Populer',
                                rows
                            }
                        ]
                    })
                },
                {
                    name: 'quick_reply',
                    buttonParamsJson: JSON.stringify({
                        display_text: '⚡ Ping',
                        id: `${prefix}ping`
                    })
                },
                {
                    name: 'quick_reply',
                    buttonParamsJson: JSON.stringify({
                        display_text: '🤖 Info Bot',
                        id: `${prefix}infobot`
                    })
                },
                {
                    name: 'quick_reply',
                    buttonParamsJson: JSON.stringify({
                        display_text: '👑 Owner',
                        id: `${prefix}owner`
                    })
                }
            ]
        }, { quoted: m.raw, mentions: [m.sender] });
    } catch {
        // Fallback otomatis ke tampilan gambar/teks penuh jika perangkat/WA menolak interactive
        await sendFallbackUI(m, sock, allListText, botConfig);
    }
}

async function sendFallbackUI(m, sock, text, botConfig) {
    const botName = botConfig.bot?.name || 'KIR4LR';
    const saluranId = botConfig.saluran?.id || '120363208449943317@newsletter';
    const saluranName = botConfig.saluran?.name || botName;
    const saluranLink = botConfig.saluran?.link || '';

    const fakeStatusQuoted = {
        key: {
            fromMe: false,
            participant: '0@s.whatsapp.net',
            remoteJid: 'status@broadcast'
        },
        message: {
            extendedTextMessage: {
                text: `✨ *${botName}*`,
                contextInfo: {
                    isForwarded: true,
                    forwardingScore: 999,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: saluranId,
                        newsletterName: saluranName,
                        serverMessageId: 127
                    }
                }
            }
        }
    };

    const imagePath = path.join(process.cwd(), 'assets', 'images', 'kir4lr.jpg');
    const thumbPath = path.join(process.cwd(), 'assets', 'images', 'kir4lr.jpg');

    const imageBuffer = fs.existsSync(imagePath) ? fs.readFileSync(imagePath) : null;
    const thumbBuffer = fs.existsSync(thumbPath) ? fs.readFileSync(thumbPath) : null;

    const messageContent = {
        contextInfo: {
            mentionedJid: [m.sender],
            forwardingScore: 9999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: saluranId,
                newsletterName: saluranName,
                serverMessageId: 127
            },
            externalAdReply: {
                title: `${botName} `,
                body: `v${botConfig.bot?.version || '1.2.0'} | ${botConfig.mode || 'public'}`,
                sourceUrl: saluranLink,
                mediaType: 1,
                showAdAttribution: false,
                renderLargerThumbnail: false
            }
        }
    };

    if (thumbBuffer) {
        messageContent.contextInfo.externalAdReply.thumbnail = thumbBuffer;
    }

    if (imageBuffer) {
        messageContent.image = imageBuffer;
        messageContent.caption = text;
    } else {
        messageContent.text = text;
    }

    try {
        await sock.sendMessage(m.chat, messageContent, { quoted: fakeStatusQuoted });
    } catch {
        await m.reply(text);
    }
}

module.exports = {
    config: pluginConfig,
    handler
};
