/**
 * Brownie-MD - A WhatsApp Bot
 * Copyright (c) 2026 Ebube
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the MIT License.
 */

const axios = require('axios');

let triviaGames = {};

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

async function startTrivia(sock, chatId, message) {
    if (triviaGames[chatId]) {
        await sock.sendMessage(chatId, { 
            text: 'A trivia game is already in progress!',
            ...channelInfo 
        }, { quoted: message });
        return;
    }

    try {
        const response = await axios.get('https://opentdb.com/api.php?amount=1&type=multiple');
        const questionData = response.data.results[0];

        triviaGames[chatId] = {
            question: questionData.question,
            correctAnswer: questionData.correct_answer,
            options: [...questionData.incorrect_answers, questionData.correct_answer].sort(),
        };

        await sock.sendMessage(chatId, {
            text: `🧠 *Trivia Time!*\n\n*Question:* ${triviaGames[chatId].question}\n\n*Options:*\n${triviaGames[chatId].options.map((opt, i) => `${i + 1}. ${opt}`).join('\n')}`,
            ...channelInfo
        }, { quoted: message });
    } catch (error) {
        await sock.sendMessage(chatId, { 
            text: 'Error fetching trivia question. Try again later.',
            ...channelInfo 
        }, { quoted: message });
    }
}

async function answerTrivia(sock, chatId, answer, message) {
    if (!triviaGames[chatId]) {
        return;
    }

    const game = triviaGames[chatId];
    let isCorrect = false;

    if (/^[1-4]$/.test(answer.trim())) {
        const index = parseInt(answer.trim()) - 1;
        if (game.options[index] && game.options[index].toLowerCase() === game.correctAnswer.toLowerCase()) {
            isCorrect = true;
        }
    } else if (answer.toLowerCase() === game.correctAnswer.toLowerCase()) {
        isCorrect = true;
    } else {
        return;
    }

    if (isCorrect) {
        await sock.sendMessage(chatId, { 
            text: `🎉 *Correct!* The answer is *${game.correctAnswer}*`,
            ...channelInfo 
        }, { quoted: message });
    } else {
        await sock.sendMessage(chatId, { 
            text: `❌ *Wrong!* The correct answer was *${game.correctAnswer}*`,
            ...channelInfo 
        }, { quoted: message });
    }

    delete triviaGames[chatId];
}

module.exports = { startTrivia, answerTrivia };
