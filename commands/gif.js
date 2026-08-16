/**
 * Brownie-MD - A WhatsApp Bot
 * Copyright (c) 2026 Ebube
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the MIT License.
 */

const axios = require('axios');
const settings = require('../settings');

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

async function gifCommand(sock, chatId, query, message) {
    const apiKey = settings.giphyApiKey;

    if (!query) {
        await sock.sendMessage(chatId, { 
            text: 'Please provide a search term for the GIF.',
            ...channelInfo
        }, { quoted: message });
        return;
    }

    try {
        const response = await axios.get(`https://api.giphy.com/v1/gifs/search`, {
            params: {
                api_key: apiKey,
                q: query,
                limit: 1,
                rating: 'g'
            }
        });

        const gifUrl = response.data.data[0]?.images?.downsized_medium?.url;

        if (gifUrl) {
            await sock.sendMessage(chatId, { 
                video: { url: gifUrl }, 
                caption: `Here is your GIF for "${query}"`,
                gifPlayback: true,
                ...channelInfo
            }, { quoted: message });
        } else {
            await sock.sendMessage(chatId, { 
                text: 'No GIFs found for your search term.',
                ...channelInfo
            }, { quoted: message });
        }
    } catch (error) {
        console.error('Error fetching GIF:', error);
        await sock.sendMessage(chatId, { 
            text: 'Failed to fetch GIF. Please try again later.',
            ...channelInfo
        }, { quoted: message });
    }
}

module.exports = gifCommand;
