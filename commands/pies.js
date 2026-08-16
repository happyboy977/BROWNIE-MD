/**
 * Brownie-MD - A WhatsApp Bot
 * Copyright (c) 2026 Ebube
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the MIT License.
 */

const fetch = require('node-fetch');

const BASE = 'https://api.shizo.top/pies';
const VALID_COUNTRIES = ['india','malaysia', 'thailand', 'china', 'indonesia', 'japan', 'korea', 'vietnam'];

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

async function fetchPiesImageBuffer(country) {
const url = `${BASE}/${country}?apikey=shizo`;
const res = await fetch(url);
if (!res.ok) throw new Error(`HTTP ${res.status}`);
const contentType = res.headers.get('content-type') || '';
if (!contentType.includes('image')) throw new Error('API did not return an image');
return res.buffer();
}

async function piesCommand(sock, chatId, message, args) {
const sub = (args && args[0] ? args[0] : '').toLowerCase();
if (!sub) {
await sock.sendMessage(chatId, { 
            text: `Usage: .pies <country>\nCountries: ${VALID_COUNTRIES.join(', ')}`,
            ...channelInfo
        }, { quoted: message });
return;
}
if (!VALID_COUNTRIES.includes(sub)) {
await sock.sendMessage(chatId, { 
            text: `❌ Unsupported country: ${sub}. Try one of: ${VALID_COUNTRIES.join(', ')}`,
            ...channelInfo
        }, { quoted: message });
return;
}
try {
const imageBuffer = await fetchPiesImageBuffer(sub);
await sock.sendMessage(
chatId,
{ 
                image: imageBuffer, 
                caption: `pies: ${sub}`,
                ...channelInfo
            },
{ quoted: message }
);
} catch (err) {
console.error('Error in pies command:', err);
await sock.sendMessage(chatId, { 
            text: '❌ Failed to fetch image. Please try again.',
            ...channelInfo
        }, { quoted: message });
}
}

async function piesAlias(sock, chatId, message, country) {
try {
const imageBuffer = await fetchPiesImageBuffer(country);
await sock.sendMessage(
chatId,
{ 
                image: imageBuffer, 
                caption: `pies: ${country}`,
                ...channelInfo
            },
{ quoted: message }
);
} catch (err) {
console.error(`Error in pies alias (${country}) command:`, err);
await sock.sendMessage(chatId, { 
            text: '❌ Failed to fetch image. Please try again.',
            ...channelInfo
        }, { quoted: message });
}
}

module.exports = { piesCommand, piesAlias, VALID_COUNTRIES };
