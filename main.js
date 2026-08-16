const fs = require('fs');
const path = require('path');
const customTemp = path.join(process.cwd(), 'temp');
if (!fs.existsSync(customTemp)) fs.mkdirSync(customTemp, { recursive: true });
process.env.TMPDIR = customTemp;
process.env.TEMP = customTemp;
process.env.TMP = customTemp;

setInterval(() => {
    fs.readdir(customTemp, (err, files) => {
        if (err) return;
        for (const file of files) {
            const filePath = path.join(customTemp, file);
            fs.stat(filePath, (err, stats) => {
                if (!err && Date.now() - stats.mtimeMs > 3 * 60 * 60 * 1000) {
                    fs.unlink(filePath, () => { });
                }
            });
        }
    });
}, 3 * 60 * 60 * 1000);

const settings = require('./settings');
require('./config.js');
const { isBanned } = require('./lib/isBanned');
const { isSudo } = require('./lib/index');
const isOwnerOrSudo = require('./lib/isOwner');
const { handleAutotypingForMessage, showTypingAfterCommand } = require('./commands/autotyping');
const { handleAutoread } = require('./commands/autoread');
const { incrementMessageCount } = require('./commands/topmembers');
const { handleBadwordDetection } = require('./lib/antibadword');
const { Antilink } = require('./lib/antilink');
const { handleChatbotResponse } = require('./commands/chatbot');
const { storeMessage } = require('./commands/antidelete');
const { handleTagDetection } = require('./commands/antitag');
const { handleMentionDetection } = require('./commands/mention');
const { handleTicTacToeMove } = require('./commands/tictactoe');

const helpCommand = require('./commands/help');
const stickerCommand = require('./commands/sticker');
const banCommand = require('./commands/ban');
const unbanCommand = require('./commands/unban');
const kickCommand = require('./commands/kick');
const pingCommand = require('./commands/ping');
const aliveCommand = require('./commands/alive');
const aiCommand = require('./commands/ai');

global.channelInfo = { contextInfo: { forwardingScore: 1, isForwarded: true, forwardedNewsletterMessageInfo: { newsletterJid: '120363407561123100@newsletter', newsletterName: 'BROWNIE-MD', serverMessageId: -1 } } };

async function handleMessages(sock, messageUpdate, printLog) {
    try {
        const { messages, type } = messageUpdate;
        if (type !== 'notify') return;
        const message = messages[0];
        if (!message?.message) return;

        await handleAutoread(sock, message);
        if (message.message) storeMessage(sock, message);

        const chatId = message.key.remoteJid;
        const senderId = message.key.participant || message.key.remoteJid;
        const isGroup = chatId.endsWith('@g.us');
        const userMessage = (message.message?.conversation?.trim() || message.message?.extendedTextMessage?.text?.trim() || '').toLowerCase().trim();

        if (isBanned(senderId) && !userMessage.startsWith('.unban')) return;
        if (!message.key.fromMe) incrementMessageCount(chatId, senderId);

        if (isGroup) {
            await handleBadwordDetection(sock, chatId, message, userMessage, senderId);
            await Antilink(message, sock);
        }

        if (!userMessage.startsWith('.')) {
            await handleAutotypingForMessage(sock, chatId, userMessage);
            if (isGroup) {
                await handleTagDetection(sock, chatId, message, senderId);
                await handleMentionDetection(sock, chatId, message);
                await handleChatbotResponse(sock, chatId, message, userMessage, senderId);
            }
            return;
        }

        switch (true) {
            case userMessage === '.help' || userMessage === '.menu': await helpCommand(sock, chatId, message); break;
            case userMessage.startsWith('.sticker'): await stickerCommand(sock, chatId, message); break;
            case userMessage.startsWith('.ban'): await banCommand(sock, chatId, message); break;
            case userMessage.startsWith('.unban'): await unbanCommand(sock, chatId, message); break;
            case userMessage.startsWith('.kick'): await kickCommand(sock, chatId, senderId, message.message.extendedTextMessage?.contextInfo?.mentionedJid || [], message); break;
            case userMessage === '.ping': await pingCommand(sock, chatId, message); break;
            case userMessage === '.alive': await aliveCommand(sock, chatId, message); break;
            case userMessage.startsWith('.ai'): await aiCommand(sock, chatId, userMessage, message); break;
            default: break;
        }
        await showTypingAfterCommand(sock, chatId, userMessage);
    } catch (err) { console.error(err); }
}
module.exports = { handleMessages };