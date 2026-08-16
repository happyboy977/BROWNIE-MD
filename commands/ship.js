/**
 * Brownie-MD - A WhatsApp Bot
 * Copyright (c) 2026 Ebube
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the MIT License.
 */

const channelInfo = {
    contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363161513685998@newsletter',
            newsletterName: 'Brownie-MD',
            serverMessageId: -1
        }
    }
};

async function shipCommand(sock, chatId, message) {
    try {
        if (!chatId.endsWith('@g.us')) {
            await sock.sendMessage(chatId, { 
                text: '❌ This command can only be used in groups.',
                ...channelInfo 
            }, { quoted: message });
            return;
        }

        const groupMetadata = await sock.groupMetadata(chatId);
        const ps = groupMetadata.participants.map(v => v.id);
        
        let firstUser, secondUser;
        
        firstUser = ps[Math.floor(Math.random() * ps.length)];
        
        do {
            secondUser = ps[Math.floor(Math.random() * ps.length)];
        } while (secondUser === firstUser);

        const formatMention = id => '@' + id.split('@')[0];
        const matchPercentage = Math.floor(Math.random() * 101);

        const caption = `🚢 *LOVE CALCULATOR* 🚢\n\n` +
                        `${formatMention(firstUser)} ❤️ ${formatMention(secondUser)}\n\n` +
                        `*Match:* ${matchPercentage}%\n\n` +
                        `Congratulations! 💖🍻`;

        await sock.sendMessage(chatId, {
            text: caption,
            mentions: [firstUser, secondUser],
            ...channelInfo
        }, { quoted: message });

    } catch (error) {
        console.error('Error in ship command:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Failed to ship! Please try again.',
            ...channelInfo 
        }, { quoted: message });
    }
}

module.exports = shipCommand;
