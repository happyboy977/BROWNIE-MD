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

async function spotifyCommand(sock, chatId, message) {
    try {
        const rawText = message.message?.conversation?.trim() ||
            message.message?.extendedTextMessage?.text?.trim() ||
            message.message?.imageMessage?.caption?.trim() ||
            message.message?.videoMessage?.caption?.trim() ||
            '';

        const used = (rawText || '').split(/\s+/)[0] || '.spotify';
        const query = rawText.slice(used.length).trim();

        if (!query) {
            await sock.sendMessage(chatId, { 
                text: '❌ Usage: .spotify <song/artist/keywords>\nExample: .spotify con calma',
                ...channelInfo 
            }, { quoted: message });
            return;
        }

        await sock.sendMessage(chatId, { 
            text: '🎵 *Searching Spotify...* Please wait.',
            ...channelInfo 
        }, { quoted: message });

        const apiUrl = `https://okatsu-rolezapiiz.vercel.app/search/spotify?q=${encodeURIComponent(query)}`;
        const { data } = await axios.get(apiUrl, { timeout: 20000, headers: { 'user-agent': 'Mozilla/5.0' } });

        if (!data?.status || !data?.result) {
            throw new Error('No result from Spotify API');
        }

        const r = data.result;
        const audioUrl = r.audio;
        if (!audioUrl) {
            await sock.sendMessage(chatId, { 
                text: '❌ No downloadable audio found for this query.',
                ...channelInfo 
            }, { quoted: message });
            return;
        }

        const caption = `🎧 *SPOTIFY DOWNLOADER*\n\n` +
                        `🎵 *Title:* ${r.title || r.name || 'Unknown Title'}\n` +
                        `👤 *Artist:* ${r.artist || 'Unknown'}\n` +
                        `⏱ *Duration:* ${r.duration || 'N/A'}\n\n` +
                        `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ Brownie-MD*`;

        if (r.thumbnails) {
            await sock.sendMessage(chatId, { 
                image: { url: r.thumbnails }, 
                caption,
                ...channelInfo 
            }, { quoted: message });
        } else {
            await sock.sendMessage(chatId, { 
                text: caption,
                ...channelInfo 
            }, { quoted: message });
        }

        await sock.sendMessage(chatId, {
            audio: { url: audioUrl },
            mimetype: 'audio/mpeg',
            fileName: `${(r.title || r.name || 'track').replace(/[\\/:*?"<>|]/g, '')}.mp3`,
            ptt: false,
            ...channelInfo
        }, { quoted: message });

    } catch (error) {
        console.error('[SPOTIFY] error:', error?.message || error);
        await sock.sendMessage(chatId, { 
            text: '❌ Failed to fetch Spotify audio. Try another query later.',
            ...channelInfo 
        }, { quoted: message });
    }
}

module.exports = spotifyCommand;
