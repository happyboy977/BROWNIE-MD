/**
 * Brownie-MD - A WhatsApp Bot
 * Copyright (c) 2026 Ebube
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the MIT License.
 */

const axios = require('axios');

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

async function wastedCommand(sock, chatId, message) {
    let userToWaste;
    
    if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
        userToWaste = message.message.extendedTextMessage.contextInfo.mentionedJid[0];
    }
    else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
        userToWaste = message.message.extendedTextMessage.contextInfo.participant;
    }
    
    if (!userToWaste) {
        await sock.sendMessage(chatId, { 
            text: '❌ Please mention someone or reply to their message to waste them!', 
            ...channelInfo 
        }, { quoted: message });
        return;
    }

    try {
        let profilePic;
        try {
            profilePic = await sock.profilePictureUrl(userToWaste, 'image');
        } catch {
            profilePic = 'https://i.imgur.com/2wzGhpF.jpeg';
        }

        const wastedResponse = await axios.get(
            `https://some-random-api.com/canvas/overlay/wasted?avatar=${encodeURIComponent(profilePic)}`,
            { responseType: 'arraybuffer' }
        );

        await sock.sendMessage(chatId, {
            image: Buffer.from(wastedResponse.data),
            caption: `⚰️ *Wasted:* @${userToWaste.split('@')[0]} 💀\n\n_Rest in pieces!_`,
            mentions: [userToWaste],
            ...channelInfo
        }, { quoted: message });

    } catch (error) {
        console.error('Error in wasted command:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Failed to create wasted image! Try again later.',
            ...channelInfo 
        }, { quoted: message });
    }
}

module.exports = wastedCommand;
