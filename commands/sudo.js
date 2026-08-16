/**
 * Brownie-MD - A WhatsApp Bot
 * Copyright (c) 2026 Ebube
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the MIT License.
 */

const settings = require('../settings');
const { addSudo, removeSudo, getSudoList } = require('../lib/index');
const isOwnerOrSudo = require('../lib/isOwner');

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

function extractMentionedJid(message) {
    const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    if (mentioned.length > 0) return mentioned[0];
    const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
    const match = text.match(/\b(\d{7,15})\b/);
    if (match) return match[1] + '@s.whatsapp.net';
    return null;
}

async function sudoCommand(sock, chatId, message) {
    const senderJid = message.key.participant || message.key.remoteJid;
    const isOwner = message.key.fromMe || await isOwnerOrSudo(senderJid, sock, chatId);

    const rawText = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
    const args = rawText.trim().split(' ').slice(1);
    const sub = (args[0] || '').toLowerCase();

    if (!sub || !['add', 'del', 'remove', 'list'].includes(sub)) {
        await sock.sendMessage(chatId, { 
            text: 'Usage:\n.sudo add <@user|number>\n.sudo del <@user|number>\n.sudo list',
            ...channelInfo 
        }, { quoted: message });
        return;
    }

    if (sub === 'list') {
        const list = await getSudoList();
        if (list.length === 0) {
            await sock.sendMessage(chatId, { 
                text: 'No sudo users set.',
                ...channelInfo 
            }, { quoted: message });
            return;
        }
        const text = list.map((j, i) => `${i + 1}. ${j}`).join('\n');
        await sock.sendMessage(chatId, { 
            text: `Sudo users:\n${text}`,
            ...channelInfo 
        }, { quoted: message });
        return;
    }

    if (!isOwner) {
        await sock.sendMessage(chatId, { 
            text: '❌ Only owner can add/remove sudo users. Use .sudo list to view.',
            ...channelInfo 
        }, { quoted: message });
        return;
    }

    const targetJid = extractMentionedJid(message);
    if (!targetJid) {
        await sock.sendMessage(chatId, { 
            text: 'Please mention a user or provide a number.',
            ...channelInfo 
        }, { quoted: message });
        return;
    }

    if (sub === 'add') {
        const ok = await addSudo(targetJid);
        await sock.sendMessage(chatId, { 
            text: ok ? `✅ Added sudo: ${targetJid}` : '❌ Failed to add sudo',
            ...channelInfo 
        }, { quoted: message });
        return;
    }

    if (sub === 'del' || sub === 'remove') {
        const ownerJid = settings.ownerNumber + '@s.whatsapp.net';
        if (targetJid === ownerJid) {
            await sock.sendMessage(chatId, { 
                text: 'Owner cannot be removed.',
                ...channelInfo 
            }, { quoted: message });
            return;
        }
        const ok = await removeSudo(targetJid);
        await sock.sendMessage(chatId, { 
            text: ok ? `✅ Removed sudo: ${targetJid}` : '❌ Failed to remove sudo',
            ...channelInfo 
        }, { quoted: message });
        return;
    }
}

module.exports = sudoCommand;
