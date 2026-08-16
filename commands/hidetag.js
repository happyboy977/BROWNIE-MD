/**
 * Brownie-MD - A WhatsApp Bot
 * Copyright (c) 2026 Ebube
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the MIT License.
 */

const isAdmin = require('../lib/isAdmin');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');

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

async function downloadMediaMessage(message, mediaType) {
    const stream = await downloadContentFromMessage(message, mediaType);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
    }
    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
    const filePath = path.join(tempDir, `${Date.now()}.${mediaType}`);
    fs.writeFileSync(filePath, buffer);
    return filePath;
}

async function hideTagCommand(sock, chatId, senderId, messageText, replyMessage, message) {
    // Check if it's a group
    if (!chatId.endsWith('@g.us')) {
        await sock.sendMessage(chatId, { 
            text: 'This command can only be used in groups.',
            ...channelInfo
        }, { quoted: message });
        return;
    }

    const { isSenderAdmin, isBotAdmin } = await isAdmin(sock, chatId, senderId);

    if (!isBotAdmin) {
        await sock.sendMessage(chatId, { 
            text: 'Please make the bot an admin first.',
            ...channelInfo
        }, { quoted: message });
        return;
    }

    if (!isSenderAdmin) {
        await sock.sendMessage(chatId, { 
            text: 'Only admins can use the .hidetag command.',
            ...channelInfo
        }, { quoted: message });
        return;
    }

    const groupMetadata = await sock.groupMetadata(chatId);
    const participants = groupMetadata.participants || [];
    const allParticipants = participants.map(p => p.id);

    if (replyMessage) {
        let content = {};
        if (replyMessage.imageMessage) {
            const filePath = await downloadMediaMessage(replyMessage.imageMessage, 'image');
            content = { 
                image: { url: filePath }, 
                caption: messageText || replyMessage.imageMessage.caption || '', 
                mentions: allParticipants,
                ...channelInfo
            };
        } else if (replyMessage.videoMessage) {
            const filePath = await downloadMediaMessage(replyMessage.videoMessage, 'video');
            content = { 
                video: { url: filePath }, 
                caption: messageText || replyMessage.videoMessage.caption || '', 
                mentions: allParticipants,
                ...channelInfo
            };
        } else if (replyMessage.conversation || replyMessage.extendedTextMessage) {
            content = { 
                text: replyMessage.conversation || replyMessage.extendedTextMessage.text, 
                mentions: allParticipants,
                ...channelInfo
            };
        } else if (replyMessage.documentMessage) {
            const filePath = await downloadMediaMessage(replyMessage.documentMessage, 'document');
            content = { 
                document: { url: filePath }, 
                fileName: replyMessage.documentMessage.fileName, 
                caption: messageText || '', 
                mentions: allParticipants,
                ...channelInfo
            };
        }

        if (Object.keys(content).length > 0) {
            await sock.sendMessage(chatId, content, { quoted: message });
        }
    } else {
        await sock.sendMessage(chatId, { 
            text: messageText || 'Tagged members.', 
            mentions: allParticipants,
            ...channelInfo
        }, { quoted: message });
    }
}

module.exports = hideTagCommand;
