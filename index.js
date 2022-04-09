const bot = require('rss-telegram-bot')
const config = require('rss-telegram-bot/config')
async function sendSubscribeTag(msg, match) {
    const chatId = msg.chat.id;
    const msgId = msg.message_id;
    const tag = match[0];
    console.log(match[0]);
}
bot.onText(/^artist:.+$/, sendSubscribeTag);
bot.onText(/^group:.+$/, sendSubscribeTag);