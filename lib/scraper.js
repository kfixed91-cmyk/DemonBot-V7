const axios = require('axios');
const ytSearch = require('yt-search');

async function ytPlay(query) {
  const result = await ytSearch(query);
  const video = result.videos[0];
  return {
    title: video.title,
    url: video.url,
    duration: video.timestamp,
    views: video.views,
    thumbnail: video.thumbnail
  };
}

async function tiktok(url) {
  const { data } = await axios.post('https://tikwm.com/api/', { url });
  return data.data;
}

async function instagram(url) {
  const { data } = await axios.get(`https://instasave.io/api?url=${url}`);
  return data;
}

async function facebook(url) {
  const { data } = await axios.get(`https://fbdown.net/api.php?url=${url}`);
  return data;
}

async function pinterest(query) {
  const { data } = await axios.get(`https://api.pinterest.com/v1/search/pins/?q=${query}&limit=10`);
  return data;
}

module.exports = {
  ytPlay,
  tiktok,
  instagram,
  facebook,
  pinterest
};
