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
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363161513685998@newsletter',
            newsletterName: 'Brownie-MD',
            serverMessageId: -1
        }
    }
};

async function unbanCommand(sock, chatId, message) {
    const isGroup = chatId.endsWith('@g.us');
    if (isGroup) {
        const senderId = message.key.participant || message.key.remoteJid;
        const { isSenderAdmin, isBotAdmin } = await isAdmin(sock, chatId, senderId);
        if (!isBotAdmin) {
            await sock.sendMessage(chatId, { text: 'Please make the bot an admin to use .unban', ...channelInfo }, { quoted: message });
            return;
        }
        if (!isSenderAdmin && !message.key.fromMe) {
            await sock.sendMessage(chatId, { text: 'Only group admins can use .unban', ...channelInfo }, { quoted: message });
            return;
        }
    } else {
        const senderId = message.key.participant || message.key.remoteJid;
        const senderIsSudo = await isSudo(senderId);
        if (!message.key.fromMe && !senderIsSudo) {
            await sock.sendMessage(chatId, { text: 'Only owner/sudo can use .unban in private chat', ...channelInfo }, { quoted: message });
            return;
        }
    }
    let userToUnban;
    
    if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
        userToUnban = message.message.extendedTextMessage.contextInfo.mentionedJid[0];
    }
    else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
        userToUnban = message.message.extendedTextMessage.contextInfo.participant;
    }
    
    if (!userToUnban) {
        await sock.sendMessage(chatId, { 
            text: 'Please mention the user or reply to their message to unban!', 
            ...channelInfo 
        }, { quoted: message });
        return;
    }

    try {
        const dataDir = path.join(__dirname, '..', 'data');
        const bannedPath = path.join(dataDir, 'banned.json');

        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        let bannedUsers = [];
        if (fs.existsSync(bannedPath)) {
            try {
                bannedUsers = JSON.parse(fs.readFileSync(bannedPath));
            } catch (e) {
                bannedUsers = [];
            }
        }

        const index = bannedUsers.indexOf(userToUnban);
        if (index > -1) {
            bannedUsers.splice(index, 1);
            fs.writeFileSync(bannedPath, JSON.stringify(bannedUsers, null, 2));
            
            await sock.sendMessage(chatId, { 
                text: `Successfully unbanned @${userToUnban.split('@')[0]}!`,
                mentions: [userToUnban],
                ...channelInfo 
            }, { quoted: message });
        } else {
            await sock.sendMessage(chatId, { 
                text: `@${userToUnban.split('@')[0]} is not banned!`,
                mentions: [userToUnban],
                ...channelInfo 
            }, { quoted: message });
        }
    } catch (error) {
        console.error('Error in unban command:', error);
        await sock.sendMessage(chatId, { text: 'Failed to unban user!', ...channelInfo }, { quoted: message });
    }
}

module.exports = unbanCommand;
