/**
 * Brownie-MD - A WhatsApp Bot
 * Copyright (c) 2026 Ebube
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the MIT License.
 */

const gTTS = require('gtts');
const fs = require('fs');
const path = require('path');

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

async function ttsCommand(sock, chatId, text, message, language = 'en') {
    if (!text) {
        await sock.sendMessage(chatId, { 
            text: 'Please provide the text for TTS conversion.',
            ...channelInfo 
        }, { quoted: message });
        return;
    }

    const fileName = `tts-${Date.now()}.mp3`;
    const assetsDir = path.join(__dirname, '..', 'assets');
    
    if (!fs.existsSync(assetsDir)) {
        fs.mkdirSync(assetsDir, { recursive: true });
    }

    const filePath = path.join(assetsDir, fileName);

    const gtts = new gTTS(text, language);
    gtts.save(filePath, async function (err) {
        if (err) {
            await sock.sendMessage(chatId, { 
                text: 'Error generating TTS audio.',
                ...channelInfo 
            }, { quoted: message });
            return;
        }

        await sock.sendMessage(chatId, {
            audio: { url: filePath },
            mimetype: 'audio/mpeg',
            ptt: true,
            ...channelInfo
        }, { quoted: message });

        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        } catch (unlinkError) {
            console.error('Error removing temporary TTS file:', unlinkError);
        }
    });
}

module.exports = ttsCommand;
