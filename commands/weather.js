/**
 * Brownie-MD - A WhatsApp Bot
 * Copyright (c) 2026 Ebube
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the MIT License.
 */

const axios = require('axios');

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

module.exports = async function (sock, chatId, message, city) {
    try {
        if (!city || !city.trim()) {
            await sock.sendMessage(chatId, { 
                text: '❌ Please provide a city name to check the weather. (e.g., .weather Nnewi)',
                ...channelInfo 
            }, { quoted: message });
            return;
        }

        const apiKey = '4902c0f2550f58298ad4146a92b65e10';
        const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city.trim())}&appid=${apiKey}&units=metric`);
        const weather = response.data;
        
        const weatherText = `🌤️ *Weather in ${weather.name}, ${weather.sys.country}*\n\n` +
            `📌 *Condition:* ${weather.weather[0].description.toUpperCase()}\n` +
            `🌡️ *Temperature:* ${weather.main.temp}°C (Feels like ${weather.main.feels_like}°C)\n` +
            `💧 *Humidity:* ${weather.main.humidity}%\n` +
            `🌬️ *Wind Speed:* ${weather.wind.speed} m/s`;

        await sock.sendMessage(chatId, { 
            text: weatherText,
            ...channelInfo 
        }, { quoted: message });
    } catch (error) {
        console.error('Error fetching weather:', error?.message || error);
        let errorMsg = '❌ Sorry, I could not fetch the weather right now.';
        if (error.response?.status === 404) {
            errorMsg = `❌ City not found. Please check the spelling and try again.`;
        }
        await sock.sendMessage(chatId, { 
            text: errorMsg,
            ...channelInfo 
        }, { quoted: message });
    }
};
