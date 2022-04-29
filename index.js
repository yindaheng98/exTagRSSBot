const bot = require('rss-telegram-bot')
const config = require('rss-telegram-bot/config')
async function sendSubscribeTag(msg, match) {
    const chatId = msg.chat.id;
    const msgId = msg.message_id;
    const tag = match[0];
    console.log(match);
}
bot.onText(/^a:"([^"\$]+)"$/, sendSubscribeTag);
bot.onText(/^a:"([^"\$]+)\$"$/, sendSubscribeTag);
bot.onText(/^a:([^"\$\s]+)$/, sendSubscribeTag);
bot.onText(/^a:([^"\$\s]+)\$$/, sendSubscribeTag);