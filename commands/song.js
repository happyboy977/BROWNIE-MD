/**
 * Brownie-MD - A WhatsApp Bot
 * Copyright (c) 2026 Ebube
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the MIT License.
 */

const axios = require('axios');
const yts = require('yt-search');
const fs = require('fs');
const path = require('path');
const { toAudio } = require('../lib/converter');

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

const AXIOS_DEFAULTS = {
    timeout: 60000,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*'
    }
};

async function tryRequest(getter, attempts = 3) {
    let lastError;
    for (let attempt = 1; attempt <= attempts; attempt++) {
        try {
            return await getter();
        } catch (err) {
            lastError = err;
            if (attempt < attempts) {
                await new Promise(r => setTimeout(r, 1000 * attempt));
            }
        }
    }
    throw lastError;
}

async function getEliteProTechDownloadByUrl(youtubeUrl) {
    const apiUrl = `https://eliteprotech-apis.zone.id/ytdown?url=${encodeURIComponent(youtubeUrl)}&format=mp3`;
    const res = await tryRequest(() => axios.get(apiUrl, AXIOS_DEFAULTS));
    if (res?.data?.success && res?.data?.downloadURL) {
        return { download: res.data.downloadURL, title: res.data.title };
    }
    throw new Error('EliteProTech ytdown returned no download');
}

async function getYupraDownloadByUrl(youtubeUrl) {
    const apiUrl = `https://api.yupra.my.id/api/downloader/ytmp3?url=${encodeURIComponent(youtubeUrl)}`;
    const res = await tryRequest(() => axios.get(apiUrl, AXIOS_DEFAULTS));
    if (res?.data?.success && res?.data?.data?.download_url) {
        return { download: res.data.data.download_url, title: res.data.data.title };
    }
    throw new Error('Yupra returned no download');
}

async function songCommand(sock, chatId, message) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
        const query = text.split(' ').slice(1).join(' ');

        if (!query) {
            await sock.sendMessage(chatId, { 
                text: '❌ Usage: .song <song name or YouTube link>',
                ...channelInfo 
            }, { quoted: message });
            return;
        }

        let video;
        if (query.includes('youtube.com') || query.includes('youtu.be')) {
            video = { url: query, title: 'YouTube Audio', thumbnail: 'https://img.pyrocdn.com/dbKUgahg.png' };
        } else {
            const search = await yts(query);
            if (!search || !search.videos.length) {
                await sock.sendMessage(chatId, { text: '❌ No results found.', ...channelInfo }, { quoted: message });
                return;
            }
            video = search.videos[0];
        }

        await sock.sendMessage(chatId, {
            image: { url: video.thumbnail },
            caption: `🎧 *Downloading:* ${video.title}\n⏱ *Duration:* ${video.timestamp}\n\n_Please wait..._`,
            ...channelInfo
        }, { quoted: message });

        let audioBuffer;
        const apiMethods = [
            () => getEliteProTechDownloadByUrl(video.url),
            () => getYupraDownloadByUrl(video.url)
        ];

        for (const method of apiMethods) {
            try {
                const data = await method();
                const audioRes = await axios.get(data.download, { responseType: 'arraybuffer' });
                audioBuffer = Buffer.from(audioRes.data);
                if (audioBuffer) break;
            } catch (e) { continue; }
        }

        if (!audioBuffer) throw new Error('Download failed.');

        const finalBuffer = await toAudio(audioBuffer, 'mp4');

        await sock.sendMessage(chatId, {
            audio: finalBuffer,
            mimetype: 'audio/mpeg',
            fileName: `${video.title.replace(/[^\w\s-]/g, '')}.mp3`,
            ptt: false,
            ...channelInfo
        }, { quoted: message });

    } catch (err) {
        console.error('Song command error:', err);
        await sock.sendMessage(chatId, { 
            text: '❌ Failed to download song.',
            ...channelInfo 
        }, { quoted: message });
    }
}

module.exports = songCommand;
