/**
 * Brownie-MD - A WhatsApp Bot
 * Copyright (c) 2026 Ebube
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the MIT License.
 */

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

async function clearCommand(sock, chatId, message) {
    try {
        const sentMessage = await sock.sendMessage(chatId, { 
            text: 'Clearing bot messages...',
            ...channelInfo
        }, { quoted: message });
        
        const messageKey = sentMessage.key;
        
        // Delete the bot's temporary status message
        await sock.sendMessage(chatId, { delete: messageKey });
        
    } catch (error) {
        console.error('Error clearing messages:', error);
        await sock.sendMessage(chatId, { 
            text: 'An error occurred while clearing messages.',
            ...channelInfo
        }, { quoted: message });
    }
}

module.exports = { clearCommand };
