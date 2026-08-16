/**
 * Brownie-MD - A WhatsApp Bot
 * Copyright (c) 2026 Ebube
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the MIT License.
 */

const fs = require('fs');
const path = require('path');

const warningsFilePath = path.join(__dirname, '../data/warnings.json');

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

function loadWarnings() {
    const dataDir = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(warningsFilePath)) {
        fs.writeFileSync(warningsFilePath, JSON.stringify({}), 'utf8');
    }
    try {
        const data = fs.readFileSync(warningsFilePath, 'utf8');
        return JSON.parse(data);
    } catch (e) {
        return {};
    }
}

async function warningsCommand(sock, chatId, mentionedJidList, message) {
    try {
        const warnings = loadWarnings();

        let userToCheck;
        if (mentionedJidList && mentionedJidList.length > 0) {
            userToCheck = mentionedJidList[0];
        } else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
            userToCheck = message.message.extendedTextMessage.contextInfo.participant;
        }

        if (!userToCheck) {
            await sock.sendMessage(chatId, { 
                text: '❌ Please mention a user or reply to their message to check warnings.',
                ...channelInfo 
            }, { quoted: message });
            return;
        }

        // Warnings are stored as warnings[chatId][userId] in warn.js, but let's support both flat and nested structures
        let warningCount = 0;
        if (warnings[chatId] && typeof warnings[chatId] === 'object') {
            warningCount = warnings[chatId][userToCheck] || 0;
        } else {
            warningCount = warnings[userToCheck] || 0;
        }

        await sock.sendMessage(chatId, { 
            text: `⚠️ @${userToCheck.split('@')[0]} has *${warningCount}/3* warning(s).`,
            mentions: [userToCheck],
            ...channelInfo 
        }, { quoted: message });
    } catch (error) {
        console.error('Error in warnings command:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Failed to check warnings.',
            ...channelInfo 
        }, { quoted: message });
    }
}

module.exports = warningsCommand;
