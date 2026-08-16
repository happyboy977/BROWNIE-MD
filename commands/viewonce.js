/**
 * Brownie-MD - A WhatsApp Bot
 * Copyright (c) 2026 Ebube
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the MIT License.
 */

const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

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

async function viewonceCommand(sock, chatId, message) {
    try {
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        
        // Handle standard viewOnceMessage wrapper if present
        let targetMessage = quoted;
        if (targetMessage?.viewOnceMessage?.message) {
            targetMessage = targetMessage.viewOnceMessage.message;
        } else if (targetMessage?.viewOnceMessageV2?.message) {
            targetMessage = targetMessage.viewOnceMessageV2.message;
        }

        const quotedImage = targetMessage?.imageMessage;
        const quotedVideo = targetMessage?.videoMessage;

        if (quotedImage) {
            const stream = await downloadContentFromMessage(quotedImage, 'image');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
            
            await sock.sendMessage(chatId, { 
                image: buffer, 
                fileName: 'media.jpg', 
                caption: quotedImage.caption || '',
                ...channelInfo 
            }, { quoted: message });
        } else if (quotedVideo) {
            const stream = await downloadContentFromMessage(quotedVideo, 'video');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
            
            await sock.sendMessage(chatId, { 
                video: buffer, 
                fileName: 'media.mp4', 
                caption: quotedVideo.caption || '',
                ...channelInfo 
            }, { quoted: message });
        } else {
            await sock.sendMessage(chatId, { 
                text: '❌ Please reply to a view-once image or video.',
                ...channelInfo 
            }, { quoted: message });
        }
    } catch (error) {
        console.error('Error in viewonce command:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Failed to retrieve view-once media.',
            ...channelInfo 
        }, { quoted: message });
    }
}

module.exports = viewonceCommand;
