/**
 * Brownie-MD - A WhatsApp Bot
 * Copyright (c) 2026 Ebube
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the MIT License.
 */

const fs = require('fs');

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

const words = ['javascript', 'bot', 'hangman', 'whatsapp', 'nodejs'];
let hangmanGames = {};

function startHangman(sock, chatId, message) {
    const word = words[Math.floor(Math.random() * words.length)];
    const maskedWord = '_ '.repeat(word.length).trim();

    hangmanGames[chatId] = {
        word,
        maskedWord: maskedWord.split(' '),
        guessedLetters: [],
        wrongGuesses: 0,
        maxWrongGuesses: 6,
    };

    sock.sendMessage(chatId, { 
        text: `🎮 *HANGMAN GAME*\n\nGame started! The word is: ${maskedWord}`,
        ...channelInfo
    }, { quoted: message });
}

function guessLetter(sock, chatId, letter, message) {
    if (!hangmanGames[chatId]) {
        sock.sendMessage(chatId, { 
            text: '❌ No game in progress. Start a new game with .hangman',
            ...channelInfo
        }, { quoted: message });
        return;
    }

    const game = hangmanGames[chatId];
    const { word, guessedLetters, maskedWord, maxWrongGuesses } = game;

    if (guessedLetters.includes(letter)) {
        sock.sendMessage(chatId, { 
            text: `⚠️ You already guessed "${letter}". Try another letter.`,
            ...channelInfo
        }, { quoted: message });
        return;
    }

    guessedLetters.push(letter);

    if (word.includes(letter)) {
        for (let i = 0; i < word.length; i++) {
            if (word[i] === letter) {
                maskedWord[i] = letter;
            }
        }
        sock.sendMessage(chatId, { 
            text: `✅ Good guess! ${maskedWord.join(' ')}`,
            ...channelInfo
        }, { quoted: message });

        if (!maskedWord.includes('_')) {
            sock.sendMessage(chatId, { 
                text: `🎉 Congratulations! You guessed the word: ${word}`,
                ...channelInfo
            }, { quoted: message });
            delete hangmanGames[chatId];
        }
    } else {
        game.wrongGuesses += 1;
        sock.sendMessage(chatId, { 
            text: `❌ Wrong guess! You have ${maxWrongGuesses - game.wrongGuesses} tries left.`,
            ...channelInfo
        }, { quoted: message });

        if (game.wrongGuesses >= maxWrongGuesses) {
            sock.sendMessage(chatId, { 
                text: `💀 Game over! The word was: ${word}`,
                ...channelInfo
            }, { quoted: message });
            delete hangmanGames[chatId];
        }
    }
}

module.exports = { startHangman, guessLetter };
