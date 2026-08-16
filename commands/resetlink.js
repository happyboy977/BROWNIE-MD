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

async function resetlinkCommand(sock, chatId, senderId, message) {
    try {
        const groupMetadata = await sock.groupMetadata(chatId);
        const isAdmin = groupMetadata.participants
            .filter(p => p.admin)
            .map(p => p.id)
            .includes(senderId);

        const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        const isBotAdmin = groupMetadata.participants
            .filter(p => p.admin)
            .map(p => p.id)
            .includes(botId);

        if (!isAdmin) {
            await sock.sendMessage(chatId, { 
                text: '❌ Only admins can use this command!',
                ...channelInfo 
            }, { quoted: message });
            return;
        }

        if (!isBotAdmin) {
            await sock.sendMessage(chatId, { 
                text: '❌ Bot must be admin to reset group link!',
                ...channelInfo 
            }, { quoted: message });
            return;
        }

        const newCode = await sock.groupRevokeInvite(chatId);
        
        await sock.sendMessage(chatId, { 
            text: `✅ Group link has been successfully reset\n\n📌 New link:\nhttps://chat.whatsapp.com/${newCode}`,
            ...channelInfo 
        }, { quoted: message });

    } catch (error) {
        console.error('Error in resetlink command:', error);
        await sock.sendMessage(chatId, { 
            text: 'Failed to reset group link!',
            ...channelInfo 
        }, { quoted: message });
    }
}

module.exports = resetlinkCommand;
