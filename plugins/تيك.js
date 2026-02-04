import axios from 'axios';

const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const downloadFromTikTok = async (url) => {
    try {
        const finalUrl = await resolveRedirects(url);
        const Medias = await fetchMedia(finalUrl, false);

        if (Medias && Medias.length > 0) {
            const mediaItems = await downloadMedia(Medias[0]);
            return {
                id: Medias[0].id,
                url: url,
                username: extractUsername(url),
                media: mediaItems
            };
        } else {
            return {
                error: `Media not found at URL: ${url}`
            };
        }
    } catch (err) {
        return { error: `Error: ${err.message}` };
    }
};

const extractUsername = (url) => {
    const match = url.match(/tiktok\.com\/@([^/]+)/);
    return match ? match[1] : null;
};

const resolveRedirects = async (url) => {
    try {
        let finalUrl = url;

        if (finalUrl.includes('vm.tiktok.com') || finalUrl.includes('vt.tiktok.com')) {
            const response = await axios.get(finalUrl, {
                maxRedirects: 10,
                headers: headers,
            });
            finalUrl = response.request.res.responseUrl;
        }

        return finalUrl;
    } catch (err) {
        throw new Error(`Failed to resolve redirects: ${err.message}`);
    }
};

const fetchMedia = async (url, watermark) => {
    try {
        const ids = await fetchIds(url);
        const results = [];
        const maxRetries = 5;

        for (const id of ids) {
            const API_URL = `https://api22-normal-c-alisg.tiktokv.com/aweme/v1/feed/?aweme_id=${id}&iid=7318518857994389254&device_id=7318517321748022790&channel=googleplay&app_name=musical_ly&version_code=300904&device_platform=android&device_type=ASUS_Z01QD&version=9`;

            let attempts = 0;
            let success = false;

            while (attempts < maxRetries && !success) {
                try {
                    await delay(2000);

                    const response = await axios({
                        url: API_URL,
                        method: 'OPTIONS',
                        headers: headers,
                    });

                    const body = response.data;

                    if (body.aweme_list && body.aweme_list.length > 0 && body.aweme_list[0].aweme_id === id) {
                        const aweme = body.aweme_list[0];
                        let mediaItems = [];

                        if (aweme.image_post_info) {
                            aweme.image_post_info.images.forEach((image) => {
                                mediaItems.push({
                                    type: 'image',
                                    data: image.display_image.url_list[1],
                                });
                            });
                        } else {
                            const urlMedia = watermark
                                ? aweme.video.download_addr.url_list[0]
                                : aweme.video.play_addr.url_list[0];
                            mediaItems.push({
                                type: 'video',
                                data: urlMedia,
                            });
                        }

                        const url = aweme?.video?.download_addr?.url_list[0] ? aweme?.video?.download_addr?.url_list[0] : aweme.video.play_addr.url_list[0];
                        const data = {
                            url: url,
                            id: id,
                            media: mediaItems,
                        };

                        results.push(data);
                        success = true;
                    } else {
                        throw new Error('No media found');
                    }
                } catch (err) {
                    await delay(2000 * (attempts + 1));
                    attempts++;
                }
            }

            if (!success) {
                throw new Error(`Failed to fetch media after ${maxRetries} attempts`);
            }
        }

        return results;
    } catch (err) {
        throw new Error(`Failed to fetch media: ${err.message}`);
    }
};

const downloadMedia = async (item) => {
    try {
        let mediaItems = [];
        let index = 1;
        for (const mediaItem of item.media) {
            let url = mediaItem.data;
            const fileName = `${item.id}_${index++}.${mediaItem.type === 'video' ? 'mp4' : 'jpeg'}`;
            if (mediaItem.type === 'video') {
                const res = await axios.get(url, { responseType: 'arraybuffer' });
                const buffer = Buffer.from(res.data);
                mediaItems.push({
                    url: url,
                    fileName: fileName,
                    type: 'video',
                    buffer: buffer
                });
            } else if (mediaItem.type === 'image') {
                const res = await axios.get(url, { responseType: 'arraybuffer' });
                const buffer = Buffer.from(res.data);
                mediaItems.push({
                    url: url,
                    fileName: fileName,
                    type: 'image',
                    buffer: buffer
                });
            }
        }

        return mediaItems;
    } catch (err) {
        throw new Error(`Failed to download media: ${err.message}`);
    }
};

const fetchIds = async (url) => {
    try {
        let ids = [];

        if (url.includes('/t/')) {
            url = await new Promise((resolve) => {
                require('follow-redirects').https.get(url, function (res) {
                    return resolve(res.responseUrl);
                });
            });
        }

        const matching = url.includes('/video/');
        const matchingPhoto = url.includes('/photo/');

        if (matching) {
            let idVideo = url.substring(
                url.indexOf('/video/') + 7,
                url.indexOf('/video/') + 26
            );
            ids.push(idVideo.length > 19 ? idVideo.substring(0, idVideo.indexOf('?')) : idVideo);
        } else if (matchingPhoto) {
            let idPhoto = url.substring(
                url.indexOf('/photo/') + 7,
                url.indexOf('/photo/') + 26
            );
            ids.push(idPhoto.length > 19 ? idPhoto.substring(0, idPhoto.indexOf('?')) : idPhoto);
        } else {
            throw new Error('URL not found');
        }

        return ids;
    } catch (err) {
        throw new Error(`Failed to fetch IDs: ${err.message}`);
    }
};

let handler = async (m, { args, conn }) => {
    if (!args[0]) throw "يرجى تقديم عنوان URL لتيك توك.";
    let result = await downloadFromTikTok(args[0]);

    if (result.error) {
        throw result.error;
    }

    if (result.media && result.media.length > 0) {
        for (const mediaItem of result.media) {
            if (mediaItem.type === 'video') {
                await conn.sendMessage(m.chat, {
                    video: mediaItem.buffer,
                    mimetype: 'video/mp4',
                    caption: `تم إرسال الفيديو\nالمستخدم: @${result.username || 'غير معروف'}`
                }, { quoted: m });
            } else if (mediaItem.type === 'image') {
                await conn.sendMessage(m.chat, {
                    image: mediaItem.buffer,
                    mimetype: 'image/jpeg',
                    caption: `تم إرسال الصورة\nالمستخدم: @${result.username || 'غير معروف'}`
                }, { quoted: m });
            }
        }
    } else {
        throw "لم يتم العثور على وسائط في هذا الرابط.";
    }
};

handler.help = handler.command = ['تيك'];
handler.tags = ['downloader'];

export default handler;