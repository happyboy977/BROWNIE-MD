/**
 * Brownie-MD - A WhatsApp Bot
 * Copyright (c) 2026 Ebube
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the MIT License.
 */

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

async function staffCommand(sock, chatId, message) {
    try {
        if (!chatId.endsWith('@g.us')) {
            await sock.sendMessage(chatId, { 
                text: '❌ This command can only be used in groups.',
                ...channelInfo 
            }, { quoted: message });
            return;
        }

        const groupMetadata = await sock.groupMetadata(chatId);
        
        let pp;
        try {
            pp = await sock.profilePictureUrl(chatId, 'image');
        } catch {
            pp = 'https://i.imgur.com/2wzGhpF.jpeg';
        }

        const participants = groupMetadata.participants;
        const groupAdmins = participants.filter(p => p.admin);
        
        if (groupAdmins.length === 0) {
            await sock.sendMessage(chatId, { 
                text: '❌ No admins found in this group.',
                ...channelInfo 
            }, { quoted: message });
            return;
        }

        const listAdmin = groupAdmins.map((v, i) => `${i + 1}. @${v.id.split('@')[0]}`).join('\n▢ ');
        const owner = groupMetadata.owner || groupAdmins.find(p => p.admin === 'superadmin')?.id || chatId.split('-')[0] + '@s.whatsapp.net';

        const text = `
≡ *GROUP ADMINS* _${groupMetadata.subject}_

┌─⊷ *ADMINS LIST*
▢ ${listAdmin}
└───────────

> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ Brownie-MD*`.trim();

        await sock.sendMessage(chatId, {
            image: { url: pp },
            caption: text,
            mentions: [...groupAdmins.map(v => v.id), owner],
            ...channelInfo
        }, { quoted: message });

    } catch (error) {
        console.error('Error in staff command:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Failed to get admin list!',
            ...channelInfo 
        }, { quoted: message });
    }
}

module.exports = staffCommand;
