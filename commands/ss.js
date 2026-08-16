/**
 * Brownie-MD - A WhatsApp Bot
 * Copyright (c) 2026 Ebube
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the MIT License.
 */

const fetch = require('node-fetch');

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

async function handleSsCommand(sock, chatId, message, match) {
    if (!match) {
        await sock.sendMessage(chatId, {
            text: `📸 *SCREENSHOT TOOL*\n\n` +
                  `• .ss <url>\n` +
                  `• .ssweb <url>\n` +
                  `• .screenshot <url>\n\n` +
                  `Take a screenshot of any website.\n\n` +
                  `*Example:* .ss https://google.com`,
            ...channelInfo
        }, { quoted: message });
        return;
    }

    try {
        await sock.presenceSubscribe(chatId);
        await sock.sendPresenceUpdate('composing', chatId);

        const url = match.trim();
        
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            await sock.sendMessage(chatId, {
                text: '❌ Please provide a valid URL starting with http:// or https://',
                ...channelInfo
            }, { quoted: message });
            return;
        }

        const apiUrl = `https://api.siputzx.my.id/api/tools/ssweb?url=${encodeURIComponent(url)}&theme=light&device=desktop`;
        const response = await fetch(apiUrl, { headers: { 'accept': '*/*' } });
        
        if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
        }

        const imageBuffer = await response.buffer();

        await sock.sendMessage(chatId, {
            image: imageBuffer,
            caption: `🌐 *Website Screenshot*\n\n📌 *URL:* ${url}`,
            ...channelInfo
        }, { quoted: message });

    } catch (error) {
        console.error('❌ Error in ss command:', error);
        await sock.sendMessage(chatId, {
            text: '❌ Failed to take screenshot. Please try again in a few minutes.\n\nPossible reasons:\n• Invalid URL\n• Website is down or blocking access\n• API service is temporarily unavailable',
            ...channelInfo
        }, { quoted: message });
    }
}

module.exports = {
    handleSsCommand
};
