/**
 * Brownie-MD - A WhatsApp Bot
 * Copyright (c) 2026 Ebube
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the MIT License.
 */
const ytdl = require('@distube/ytdl-core');
const yts = require('youtube-yts');
const readline = require('readline');
const ffmpeg = require('fluent-ffmpeg');
const NodeID3 = require('node-id3');
const fs = require('fs');
const { fetchBuffer } = require("./myfunc2");
const ytM = require('node-youtube-music');
const { randomBytes } = require('crypto');
const path = require('path');

const ytIdRegex = /(?:youtube\.com\/\S*(?:(?:\/e(?:mbed))?\/|watch\?(?:\S*?&?v\=))|youtu\.be\/)([a-zA-Z0-9_-]{6,11})/;

class YTDownloader {
    constructor() {
        this.tmpDir = path.join(process.cwd(), 'tmp');
        if (!fs.existsSync(this.tmpDir)) {
            fs.mkdirSync(this.tmpDir, { recursive: true });
        }
    }

    static isYTUrl = (url) => ytIdRegex.test(url);

    static getVideoID = (url) => {
        if (!this.isYTUrl(url)) throw new Error('is not YouTube URL');
        return ytIdRegex.exec(url)[1];
    }

    static WriteTags = async (filePath, Metadata) => {
        NodeID3.write({
            title: Metadata.Title,
            artist: Metadata.Artist,
            originalArtist: Metadata.Artist,
            image: {
                mime: 'jpeg',
                type: { id: 3, name: 'front cover' },
                imageBuffer: (await fetchBuffer(Metadata.Image)).buffer,
                description: `Cover of ${Metadata.Title}`,
            },
            album: Metadata.Album,
            year: Metadata.Year || ''
        }, filePath);
    }

    static search = async (query, options = {}) => {
        const search = await yts.search({ query, hl: 'id', gl: 'ID', ...options });
        return search.videos;
    }

    static searchTrack = (query) => {
        return new Promise(async (resolve, reject) => {
            try {
                let ytMusic = await ytM.searchMusics(query);
                let result = ytMusic.map(music => ({
                    isYtMusic: true,
                    title: `${music.title} - ${music.artists.map(x => x.name).join(' ')}`,
                    artist: music.artists.map(x => x.name).join(' '),
                    id: music.youtubeId,
                    url: 'https://youtu.be/' + music.youtubeId,
                    album: music.album,
                    duration: { seconds: music.duration.totalSeconds, label: music.duration.label },
                    image: music.thumbnailUrl.replace('w120-h120', 'w600-h600')
                }));
                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
    }

    async downloadMusic(query) {
        try {
            const tracks = Array.isArray(query) ? query : await YTDownloader.searchTrack(query);
            const search = tracks[0];
            const info = await ytdl.getInfo(search.url);
            
            const fileName = `${randomBytes(3).toString('hex')}.mp3`;
            const filePath = path.join(this.tmpDir, fileName);

            return new Promise((resolve, reject) => {
                const stream = ytdl(search.url, { quality: 'highestaudio', filter: 'audioonly' });
                ffmpeg(stream)
                    .audioBitrate(128)
                    .toFormat('mp3')
                    .save(filePath)
                    .on('end', async () => {
                        await YTDownloader.WriteTags(filePath, { 
                            Title: search.title, 
                            Artist: search.artist, 
                            Image: search.image, 
                            Album: search.album, 
                            Year: info.videoDetails.publishDate.split('-')[0] 
                        });
                        resolve({ meta: search, path: filePath, size: fs.statSync(filePath).size });
                    })
                    .on('error', reject);
            });
        } catch (error) {
            throw error;
        }
    }

    static mp4 = async (query, quality = 134) => {
        try {
            if (!query) throw new Error('Video ID or YouTube Url is required');
            const videoId = this.isYTUrl(query) ? this.getVideoID(query) : query;
            const videoInfo = await ytdl.getInfo('https://www.youtube.com/watch?v=' + videoId);
            const format = ytdl.chooseFormat(videoInfo.formats, { format: quality, filter: 'videoandaudio' });
            return {
                title: videoInfo.videoDetails.title,
                thumb: videoInfo.videoDetails.thumbnails.slice(-1)[0],
                date: videoInfo.videoDetails.publishDate,
                duration: videoInfo.videoDetails.lengthSeconds,
                channel: videoInfo.videoDetails.ownerChannelName,
                quality: format.qualityLabel,
                contentLength: format.contentLength,
                videoUrl: format.url
            };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new YTDownloader();
