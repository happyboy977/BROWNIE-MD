/**
 * Brownie-MD - A WhatsApp Bot
 * Copyright (c) 2026 Ebube
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the MIT License.
 */

const fs = require('fs');
const path = require('path');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const webp = require('node-webpmux');
const crypto = require('crypto');
const settings = require('../settings');

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

async function takeCommand(sock, chatId, message, args) {
    try {
        const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quotedMessage?.stickerMessage) {
            await sock.sendMessage(chatId, { 
                text: '❌ Reply to a sticker with .take <packname>',
                ...channelInfo 
            }, { quoted: message });
            return;
        }

        const packname = args.join(' ') || settings.packname || 'Brownie-MD';

        try {
            const stickerBuffer = await downloadMediaMessage(
                {
                    key: {
                        remoteJid: chatId,
                        id: message.message.extendedTextMessage.contextInfo.stanzaId,
                        participant: message.message.extendedTextMessage.contextInfo.participant
                    },
                    message: quotedMessage
                },
                'buffer',
                {},
                {
                    logger: undefined,
                    reuploadRequest: sock.updateMediaMessage
                }
            );

            if (!stickerBuffer) {
                await sock.sendMessage(chatId, { 
                    text: '❌ Failed to download sticker',
                    ...channelInfo 
                }, { quoted: message });
                return;
            }

            const img = new webp.Image();
            await img.load(stickerBuffer);

            const json = {
                'sticker-pack-id': crypto.randomBytes(32).toString('hex'),
                'sticker-pack-name': packname,
                'emojis': ['🤖']
            };

            const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
            const jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8');
            const exif = Buffer.concat([exifAttr, jsonBuffer]);
            exif.writeUIntLE(jsonBuffer.length, 14, 4);

            img.exif = exif;

            const finalBuffer = await img.save(null);

            await sock.sendMessage(chatId, {
                sticker: finalBuffer,
                ...channelInfo
            }, {
                quoted: message
            });

        } catch (error) {
            console.error('Sticker processing error:', error);
            await sock.sendMessage(chatId, { 
                text: '❌ Error processing sticker',
                ...channelInfo 
            }, { quoted: message });
        }

    } catch (error) {
        console.error('Error in take command:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Error processing command',
            ...channelInfo 
        }, { quoted: message });
    }
}

module.exports = takeCommand;
