/**
 * Brownie-MD - A WhatsApp Bot
 * Copyright (c) 2026 Ebube
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the MIT License.
 */

const fs = require('fs');
const path = require('path');
const isAdmin = require('../lib/isAdmin');
const { isSudo } = require('../lib/index');

const channelInfo = {
    contextInfo: {
        forwardingScore: 1,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: 'add your channel jid',
            newsletterName: 'Brownie-MD',
            serverMessageId: -1
        }
    }
};

async function banCommand(sock, chatId, message) {
    // Restrict in groups to admins; in private to owner/sudo
    const isGroup = chatId.endsWith('@g.us');
    if (isGroup) {
        const senderId = message.key.participant || message.key.remoteJid;
        const { isSenderAdmin, isBotAdmin } = await isAdmin(sock, chatId, senderId);
        if (!isBotAdmin) {
            await sock.sendMessage(chatId, { text: 'Please make the bot an admin to use .ban', ...channelInfo }, { quoted: message });
            return;
        }
        if (!isSenderAdmin && !message.key.fromMe) {
            await sock.sendMessage(chatId, { text: 'Only group admins can use .ban', ...channelInfo }, { quoted: message });
            return;
        }
    } else {
        const senderId = message.key.participant || message.key.remoteJid;
        const senderIsSudo = await isSudo(senderId);
        if (!message.key.fromMe && !senderIsSudo) {
            await sock.sendMessage(chatId, { text: 'Only owner/sudo can use .ban in private chat', ...channelInfo }, { quoted: message });
            return;
        }
    }
    let userToBan;
    
    // Check for mentioned users
    if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
        userToBan = message.message.extendedTextMessage.contextInfo.mentionedJid[0];
    }
    // Check for replied message
    else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
        userToBan = message.message.extendedTextMessage.contextInfo.participant;
    }
    
    if (!userToBan) {
        await sock.sendMessage(chatId, { 
            text: 'Please mention the user or reply to their message to ban!', 
            ...channelInfo 
        }, { quoted: message });
        return;
    }

    // Prevent banning the bot itself
    try {
        const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        if (userToBan === botId || userToBan === botId.replace('@s.whatsapp.net', '@lid')) {
            await sock.sendMessage(chatId, { text: 'You cannot ban the bot account.', ...channelInfo }, { quoted: message });
            return;
        }
    } catch {}

    try {
        const dataDir = path.join(__dirname, '../data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        const bannedPath = path.join(dataDir, 'banned.json');
        if (!fs.existsSync(bannedPath)) {
            fs.writeFileSync(bannedPath, JSON.stringify([], null, 2));
        }

        // Add user to banned list
        const bannedUsers = JSON.parse(fs.readFileSync(bannedPath));
        if (!bannedUsers.includes(userToBan)) {
            bannedUsers.push(userToBan);
            fs.writeFileSync(bannedPath, JSON.stringify(bannedUsers, null, 2));
            
            await sock.sendMessage(chatId, { 
                text: `Successfully banned @${userToBan.split('@')[0]}!`,
                mentions: [userToBan],
                ...channelInfo 
            }, { quoted: message });
        } else {
            await sock.sendMessage(chatId, { 
                text: `@${userToBan.split('@')[0]} is already banned!`,
                mentions: [userToBan],
                ...channelInfo 
            }, { quoted: message });
        }
    } catch (error) {
        console.error('Error in ban command:', error);
        await sock.sendMessage(chatId, { text: 'Failed to ban user!', ...channelInfo }, { quoted: message });
    }
}

module.exports = banCommand;
