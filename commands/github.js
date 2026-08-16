/**
 * Brownie-MD - A WhatsApp Bot
 * Copyright (c) 2026 Ebube
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the MIT License.
 */

const moment = require('moment-timezone');
const fetch = require('node-fetch');
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

async function githubCommand(sock, chatId, message) {
  try {
    const res = await fetch('https://api.github.com/repos/happyboy977/Brownie-MD');
    if (!res.ok) throw new Error('Error fetching repository data');
    const json = await res.json();

    let txt = `*☆  Brownie-MD  ☆*\n\n`;
    txt += `✩  *Name* : ${json.name}\n`;
    txt += `✩  *Watchers* : ${json.watchers_count}\n`;
    txt += `✩  *Size* : ${(json.size / 1024).toFixed(2)} MB\n`;
    txt += `✩  *Last Updated* : ${moment(json.updated_at).format('DD/MM/YY - HH:mm:ss')}\n`;
    txt += `✩  *URL* : ${json.html_url}\n`;
    txt += `✩  *Forks* : ${json.forks_count}\n`;
    txt += `✩  *Stars* : ${json.stargazers_count}\n\n`;
    txt += `💥 *Powered by Ebube*`;

    // Use the local asset image
    const imgPath = path.join(__dirname, '../assets/bot_image.jpg');
    let imgBuffer;
    
    if (fs.existsSync(imgPath)) {
        imgBuffer = fs.readFileSync(imgPath);
    }

    if (imgBuffer) {
        await sock.sendMessage(chatId, { 
            image: imgBuffer, 
            caption: txt,
            ...channelInfo
        }, { quoted: message });
    } else {
        await sock.sendMessage(chatId, { 
            text: txt,
            ...channelInfo
        }, { quoted: message });
    }
  } catch (error) {
    console.error('Error in github command:', error);
    await sock.sendMessage(chatId, { 
        text: '❌ Error fetching repository information.',
        ...channelInfo
    }, { quoted: message });
  }
}

module.exports = githubCommand;
