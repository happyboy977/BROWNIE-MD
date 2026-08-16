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

module.exports = async function (sock, chatId, message) {
    try {
        const response = await axios.get('https://icanhazdadjoke.com/', {
            headers: { Accept: 'application/json' }
        });
        const joke = response.data.joke;
        
        await sock.sendMessage(chatId, { 
            text: joke,
            ...channelInfo
        }, { quoted: message });

    } catch (error) {
        console.error('Error fetching joke:', error);
        await sock.sendMessage(chatId, { 
            text: 'Sorry, I could not fetch a joke right now.',
            ...channelInfo
        }, { quoted: message });
    }
};
