/**
 * Brownie-MD - A WhatsApp Bot
 * Copyright (c) 2026 Ebube
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the MIT License.
 */

const axios = require('axios');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { uploadImage } = require('../lib/uploadImage');

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

async function getQuotedOrOwnImageUrl(sock, message) {
    const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (quoted?.imageMessage) {
        const stream = await downloadContentFromMessage(quoted.imageMessage, 'image');
        const chunks = [];
        for await (const chunk of stream) chunks.push(chunk);
        const buffer = Buffer.concat(chunks);
        return await uploadImage(buffer);
    }

    if (message.message?.imageMessage) {
        const stream = await downloadContentFromMessage(message.message.imageMessage, 'image');
        const chunks = [];
        for await (const chunk of stream) chunks.push(chunk);
        const buffer = Buffer.concat(chunks);
        return await uploadImage(buffer);
    }

    let targetJid;
    const ctx = message.message?.extendedTextMessage?.contextInfo;
    if (ctx?.mentionedJid?.length > 0) {
        targetJid = ctx.mentionedJid[0];
    } else if (ctx?.participant) {
        targetJid = ctx.participant;
    } else {
        targetJid = message.key.participant || message.key.remoteJid;
    }

    try {
        const url = await sock.profilePictureUrl(targetJid, 'image');
        return url;
    } catch {
        return 'https://i.imgur.com/2wzGhpF.png';
    }
}

async function miscCommand(sock, chatId, message, args) {
    const sub = (args[0] || '').toLowerCase();
    const rest = args.slice(1);

    async function simpleAvatarOnly(endpoint, isOverlay = false) {
        const avatarUrl = await getQuotedOrOwnImageUrl(sock, message);
        const path = isOverlay ? 'overlay' : 'misc';
        const url = `https://api.some-random-api.com/canvas/${path}/${endpoint}?avatar=${encodeURIComponent(avatarUrl)}`;
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        await sock.sendMessage(chatId, { 
            image: Buffer.from(response.data),
            ...channelInfo
        }, { quoted: message });
    }

    try {
        switch (sub) {
            case 'heart':
            case 'horny':
            case 'circle':
            case 'lgbt':
            case 'lied':
            case 'lolice':
            case 'simpcard':
            case 'tonikawa':
                await simpleAvatarOnly(sub);
                break;

            case 'its-so-stupid': {
                const dog = rest.join(' ').trim();
                if (!dog) {
                    await sock.sendMessage(chatId, { text: 'Usage: .misc its-so-stupid <text>', ...channelInfo }, { quoted: message });
                    return;
                }
                const avatarUrl = await getQuotedOrOwnImageUrl(sock, message);
                const url = `https://api.some-random-api.com/canvas/misc/its-so-stupid?dog=${encodeURIComponent(dog)}&avatar=${encodeURIComponent(avatarUrl)}`;
                const response = await axios.get(url, { responseType: 'arraybuffer' });
                await sock.sendMessage(chatId, { image: Buffer.from(response.data), ...channelInfo }, { quoted: message });
                break;
            }

            case 'namecard': {
                const joined = rest.join(' ');
                const [username, birthday, description] = joined.split('|').map(s => (s || '').trim());
                if (!username || !birthday) {
                    await sock.sendMessage(chatId, { text: 'Usage: .misc namecard username|birthday|description(optional)', ...channelInfo }, { quoted: message });
                    return;
                }
                const avatarUrl = await getQuotedOrOwnImageUrl(sock, message);
                const params = new URLSearchParams({ username, birthday, avatar: avatarUrl });
                if (description) params.append('description', description);
                const url = `https://api.some-random-api.com/canvas/misc/namecard?${params.toString()}`;
                const response = await axios.get(url, { responseType: 'arraybuffer' });
                await sock.sendMessage(chatId, { image: Buffer.from(response.data), ...channelInfo }, { quoted: message });
                break;
            }
           
            case 'oogway':
            case 'oogway2': {
                const quote = rest.join(' ').trim();
                if (!quote) {
                    await sock.sendMessage(chatId, { text: `Usage: .misc ${sub} <quote>`, ...channelInfo }, { quoted: message });
                    return;
                }
                const avatarUrl = await getQuotedOrOwnImageUrl(sock, message);
                const url = `https://api.some-random-api.com/canvas/misc/${sub}?quote=${encodeURIComponent(quote)}&avatar=${encodeURIComponent(avatarUrl)}`;
                const response = await axios.get(url, { responseType: 'arraybuffer' });
                await sock.sendMessage(chatId, { image: Buffer.from(response.data), ...channelInfo }, { quoted: message });
                break;
            }

            case 'tweet': {
                const joined = rest.join(' ');
                const [displayname, username, comment, theme] = joined.split('|').map(s => (s || '').trim());
                if (!displayname || !username || !comment) {
                    await sock.sendMessage(chatId, { text: 'Usage: .misc tweet displayname|username|comment|theme(optional light/dark)', ...channelInfo }, { quoted: message });
                    return;
                }
                const avatarUrl = await getQuotedOrOwnImageUrl(sock, message);
                const params = new URLSearchParams({ displayname, username, comment, avatar: avatarUrl });
                if (theme) params.append('theme', theme);
                const url = `https://api.some-random-api.com/canvas/misc/tweet?${params.toString()}`;
                const response = await axios.get(url, { responseType: 'arraybuffer' });
                await sock.sendMessage(chatId, { image: Buffer.from(response.data), ...channelInfo }, { quoted: message });
                break;
            }

            case 'youtube-comment': {
                const joined = rest.join(' ');
                const [username, comment] = joined.split('|').map(s => (s || '').trim());
                if (!username || !comment) {
                    await sock.sendMessage(chatId, { text: 'Usage: .misc youtube-comment username|comment', ...channelInfo }, { quoted: message });
                    return;
                }
                const avatarUrl = await getQuotedOrOwnImageUrl(sock, message);
                const params = new URLSearchParams({ username, comment, avatar: avatarUrl });
                const url = `https://api.some-random-api.com/canvas/misc/youtube-comment?${params.toString()}`;
                const response = await axios.get(url, { responseType: 'arraybuffer' });
                await sock.sendMessage(chatId, { image: Buffer.from(response.data), ...channelInfo }, { quoted: message });
                break;
            }

            case 'comrade':
            case 'gay':
            case 'glass':
            case 'jail':
            case 'passed':
            case 'triggered':
                await simpleAvatarOnly(sub, true);
                break;

            default:
                await sock.sendMessage(chatId, { 
                    text: 'Usage: .misc <heart|horny|circle|lgbt|lied|lolice|simpcard|tonikawa|its-so-stupid|namecard|oogway|tweet|youtube-comment|triggered...>',
                    ...channelInfo
                }, { quoted: message });
                break;
        }
    } catch (error) {
        console.error('Error in misc command:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Failed to generate image. Check your parameters and try again.',
            ...channelInfo
        }, { quoted: message });
    }
}

module.exports = { miscCommand };
