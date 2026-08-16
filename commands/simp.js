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

async function simpCommand(sock, chatId, message) {
    try {
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const participant = message.message?.extendedTextMessage?.contextInfo?.participant;
        const mentionedJid = message.message?.extendedTextMessage?.contextInfo?.mentionedJid;
        const sender = message.key.participant || message.key.remoteJid;

        let who = (mentionedJid && mentionedJid.length > 0) 
            ? mentionedJid[0] 
            : (participant || sender);

        let avatarUrl;
        try {
            avatarUrl = await sock.profilePictureUrl(who, 'image');
        } catch (error) {
            avatarUrl = 'https://telegra.ph/file/24fa902ead26340f3df2c.png';
        }

        const apiUrl = `https://some-random-api.com/canvas/misc/simpcard?avatar=${encodeURIComponent(avatarUrl)}`;
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const imageBuffer = await response.buffer();

        await sock.sendMessage(chatId, {
            image: imageBuffer,
            caption: `*Your religion is simping, @${who.split('@')[0]}!* 🤡`,
            mentions: [who],
            ...channelInfo
        }, { quoted: message });

    } catch (error) {
        console.error('Error in simp command:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Sorry, I couldn\'t generate the simp card. Please try again later!',
            ...channelInfo 
        }, { quoted: message });
    }
}

module.exports = { simpCommand };
