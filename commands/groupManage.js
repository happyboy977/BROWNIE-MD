/**
 * Brownie-MD - A WhatsApp Bot
 * Copyright (c) 2026 Ebube
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the MIT License.
 */

const fs = require('fs');
const path = require('path');
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

async function ensureGroupAndAdmin(sock, chatId, senderId, message) {
    const isGroup = chatId.endsWith('@g.us');
    if (!isGroup) {
        await sock.sendMessage(chatId, { 
            text: 'This command can only be used in groups.',
            ...channelInfo
        }, { quoted: message });
        return { ok: false };
    }
    
    // Check admin status of sender and bot
    const isAdmin = require('../lib/isAdmin');
    const adminStatus = await isAdmin(sock, chatId, senderId);
    
    if (!adminStatus.isBotAdmin) {
        await sock.sendMessage(chatId, { 
            text: 'Please make the bot an admin first.',
            ...channelInfo
        }, { quoted: message });
        return { ok: false };
    }
    
    if (!adminStatus.isSenderAdmin) {
        await sock.sendMessage(chatId, { 
            text: 'Only group admins can use this command.',
            ...channelInfo
        }, { quoted: message });
        return { ok: false };
    }
    
    return { ok: true };
}

async function setGroupDescription(sock, chatId, senderId, text, message) {
    const check = await ensureGroupAndAdmin(sock, chatId, senderId, message);
    if (!check.ok) return;
    
    const desc = (text || '').trim();
    if (!desc) {
        await sock.sendMessage(chatId, { 
            text: 'Usage: .setgdesc <description>',
            ...channelInfo
        }, { quoted: message });
        return;
    }
    
    try {
        await sock.groupUpdateDescription(chatId, desc);
        await sock.sendMessage(chatId, { 
            text: '✅ Group description updated.',
            ...channelInfo
        }, { quoted: message });
    } catch (e) {
        await sock.sendMessage(chatId, { 
            text: '❌ Failed to update group description.',
            ...channelInfo
        }, { quoted: message });
    }
}

async function setGroupName(sock, chatId, senderId, text, message) {
    const check = await ensureGroupAndAdmin(sock, chatId, senderId, message);
    if (!check.ok) return;
    
    const name = (text || '').trim();
    if (!name) {
        await sock.sendMessage(chatId, { 
            text: 'Usage: .setgname <new name>',
            ...channelInfo
        }, { quoted: message });
        return;
    }
    
    try {
        await sock.groupUpdateSubject(chatId, name);
        await sock.sendMessage(chatId, { 
            text: '✅ Group name updated.',
            ...channelInfo
        }, { quoted: message });
    } catch (e) {
        await sock.sendMessage(chatId, { 
            text: '❌ Failed to update group name.',
            ...channelInfo
        }, { quoted: message });
    }
}

async function setGroupPhoto(sock, chatId, senderId, message) {
    const check = await ensureGroupAndAdmin(sock, chatId, senderId, message);
    if (!check.ok) return;

    const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const imageMessage = quoted?.imageMessage || quoted?.stickerMessage;
    
    if (!imageMessage) {
        await sock.sendMessage(chatId, { 
            text: 'Reply to an image/sticker with .setgpp',
            ...channelInfo
        }, { quoted: message });
        return;
    }
    
    try {
        const tmpDir = path.join(process.cwd(), 'tmp');
        if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

        const stream = await downloadContentFromMessage(imageMessage, 'image');
        let buffer = Buffer.from([]);
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

        const imgPath = path.join(tmpDir, `gpp_${Date.now()}.jpg`);
        fs.writeFileSync(imgPath, buffer);

        await sock.updateProfilePicture(chatId, { url: imgPath });
        try { fs.unlinkSync(imgPath); } catch (_) {}
        
        await sock.sendMessage(chatId, { 
            text: '✅ Group profile photo updated.',
            ...channelInfo
        }, { quoted: message });
    } catch (e) {
        await sock.sendMessage(chatId, { 
            text: '❌ Failed to update group profile photo.',
            ...channelInfo
        }, { quoted: message });
    }
}

module.exports = {
    setGroupDescription,
    setGroupName,
    setGroupPhoto
};
