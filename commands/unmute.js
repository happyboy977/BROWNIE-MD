/**
 * Brownie-MD - A WhatsApp Bot
 * Copyright (c) 2026 Ebube
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the MIT License.
 */

const isAdmin = require('../lib/isAdmin');

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

async function unmuteCommand(sock, chatId, senderId, message) {
    try {
        const isGroup = chatId.endsWith('@g.us');
        if (isGroup) {
            const { isSenderAdmin, isBotAdmin } = await isAdmin(sock, chatId, senderId);
            if (!isBotAdmin) {
                await sock.sendMessage(chatId, { 
                    text: 'Please make the bot an admin first.',
                    ...channelInfo 
                }, { quoted: message });
                return;
            }
            if (!isSenderAdmin && !message.key.fromMe) {
                await sock.sendMessage(chatId, { 
                    text: 'Only group admins can use the .unmute command.',
                    ...channelInfo 
                }, { quoted: message });
                return;
            }
        }

        await sock.groupSettingUpdate(chatId, 'not_announcement');
        await sock.sendMessage(chatId, { 
            text: '🔊 The group has been unmuted. Everyone can send messages now.',
            ...channelInfo 
        }, { quoted: message });
    } catch (error) {
        console.error('Error in unmute command:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Failed to unmute the group. Please try again.',
            ...channelInfo 
        }, { quoted: message });
    }
}

module.exports = unmuteCommand;
