/**
 * Brownie-MD - A WhatsApp Bot
 * Copyright (c) 2026 Ebube
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the MIT License.
 */

const settings = require('../settings');
const fs = require('fs');
const path = require('path');

const channelInfo = {
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
        newsletterJid: '120363161513685998@newsletter',
        newsletterName: 'Brownie-MD',
        serverMessageId: -1
    }
};

async function helpCommand(sock, chatId, message) {
    const helpMessage = `
╭━━━━〔 *Brownie-MD* 〕━━━━╮
┃ 🛠️ Version: *3.0.0*
┃ 👤 Owner: *Ebube*
┃ 🤖 Bot: *Brownie-MD*
╰━━━━━━━━━━━━━━━━━━━━━━━╯

*COMMAND LIST:*

╭───〔 🌐 *GENERAL* 〕───╮
│ ● .help | .menu
│ ● .ping
│ ● .alive
│ ● .tts <text>
│ ● .owner
│ ● .joke | .quote | .fact
│ ● .weather | .news
│ ● .attp | .lyrics
│ ● .8ball | .groupinfo
│ ● .staff | .vv
│ ● .trt | .ss | .jid | .url
╰━━━━━━━━━━━━━━━━━━━━━━╯

╭───〔 👮 *ADMIN* 〕───╮
│ ✧ .ban | .kick | .warn
│ ✧ .promote | .demote
│ ✧ .mute | .unmute
│ ✧ .delete | .clear
│ ✧ .tagall | .hidetag
│ ✧ .antilink | .antibadword
│ ✧ .welcome | .goodbye
│ ✧ .setgname | .setgpp
╰━━━━━━━━━━━━━━━━━━━━━━╯

╭───〔 🔒 *OWNER* 〕───╮
│ ◈ .mode <public/private>
│ ◈ .clearsession | .cleartmp
│ ◈ .update | .settings
│ ◈ .autostatus | .autoread
│ ◈ .anticall | .pmblocker
│ ◈ .setpp | .setmention
╰━━━━━━━━━━━━━━━━━━━━━━╯

╭───〔 🎨 *EDITING* 〕───╮
│ 🖋️ .sticker | .simage
│ 🖋️ .remini | .removebg
│ 🖋️ .blur | .crop | .meme
│ 🖋️ .take | .emojimix
│ 🖋️ .igs | .igsc
╰━━━━━━━━━━━━━━━━━━━━━━╯

╭───〔 🤖 *AI & GAMES* 〕───╮
│ 🧠 .gpt | .gemini
│ 🖼️ .imagine | .flux | .sora
│ 🎮 .tictactoe | .hangman
│ 🎮 .trivia | .truth | .dare
╰━━━━━━━━━━━━━━━━━━━━━━╯

╭───〔 📥 *DOWNLOADER* 〕───╮
│ ↓ .play | .song | .video
│ ↓ .spotify | .ytmp4
│ ↓ .instagram | .facebook
│ ↓ .tiktok
╰━━━━━━━━━━━━━━━━━━━━━━╯

╭───〔 🔤 *TEXTMAKER* 〕───╮
│ ✎ .neon | .glitch | .fire
│ ✎ .ice | .snow | .matrix
│ ✎ .hacker | .devil | .sand
╰━━━━━━━━━━━━━━━━━━━━━━╯

╭───〔 💻 *SYSTEM* 〕───╮
│ ⚙️ .git | .github
│ ⚙️ .sc | .repo | .script
╰━━━━━━━━━━━━━━━━━━━━━━╯

*Join our channel for updates:*`;

    try {
        const imagePath = path.join(__dirname, '../assets/bot_image.jpg');

        if (fs.existsSync(imagePath)) {
            const imageBuffer = fs.readFileSync(imagePath);
            await sock.sendMessage(chatId, {
                image: imageBuffer,
                caption: helpMessage,
                ...channelInfo
            }, { quoted: message });
        } else {
            await sock.sendMessage(chatId, { 
                text: helpMessage,
                ...channelInfo
            }, { quoted: message });
        }
    } catch (error) {
        console.error('Error in help command:', error);
        await sock.sendMessage(chatId, { 
            text: helpMessage,
            ...channelInfo
        }, { quoted: message });
    }
}

module.exports = helpCommand;
