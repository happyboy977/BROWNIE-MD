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

async function rosedayCommand(sock, chatId, message) {
    try {
        const res = await fetch(`https://api.princetechn.com/api/fun/roseday?apikey=prince`);
        
        if (!res.ok) {
            throw await res.text();
        }
        
        const json = await res.json();
        const rosedayMessage = json.result;

        await sock.sendMessage(chatId, { 
            text: rosedayMessage,
            ...channelInfo 
        }, { quoted: message });
    } catch (error) {
        console.error('Error in roseday command:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Failed to get roseday quote. Please try again later!',
            ...channelInfo 
        }, { quoted: message });
    }
}

module.exports = { rosedayCommand };
