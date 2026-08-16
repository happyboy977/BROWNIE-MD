/**
 * Brownie-MD - A WhatsApp Bot
 * Copyright (c) 2026 Ebube
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the MIT License.
 */

const fs = require('fs');
const path = require('path');

const dataFilePath = path.join(__dirname, '..', 'data', 'messageCount.json');

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

function loadMessageCounts() {
    if (fs.existsSync(dataFilePath)) {
        const data = fs.readFileSync(dataFilePath);
        return JSON.parse(data);
    }
    return {};
}

function saveMessageCounts(messageCounts) {
    const dir = path.dirname(dataFilePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(dataFilePath, JSON.stringify(messageCounts, null, 2));
}

function incrementMessageCount(groupId, userId) {
    const messageCounts = loadMessageCounts();

    if (!messageCounts[groupId]) {
        messageCounts[groupId] = {};
    }

    if (!messageCounts[groupId][userId]) {
        messageCounts[groupId][userId] = 0;
    }

    messageCounts[groupId][userId] += 1;

    saveMessageCounts(messageCounts);
}

async function topMembers(sock, chatId, isGroup, message) {
    if (!isGroup) {
        await sock.sendMessage(chatId, { 
            text: 'This command is only available in group chats.',
            ...channelInfo 
        }, { quoted: message });
        return;
    }

    const messageCounts = loadMessageCounts();
    const groupCounts = messageCounts[chatId] || {};

    const sortedMembers = Object.entries(groupCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

    if (sortedMembers.length === 0) {
        await sock.sendMessage(chatId, { 
            text: 'No message activity recorded yet.',
            ...channelInfo 
        }, { quoted: message });
        return;
    }

    let responseText = '🏆 *Top Members Based on Message Count:*\n\n';
    sortedMembers.forEach(([userId, count], index) => {
        responseText += `${index + 1}. @${userId.split('@')[0]} - ${count} messages\n`;
    });

    await sock.sendMessage(chatId, { 
        text: responseText, 
        mentions: sortedMembers.map(([userId]) => userId),
        ...channelInfo 
    }, { quoted: message });
}

module.exports = { incrementMessageCount, topMembers };
