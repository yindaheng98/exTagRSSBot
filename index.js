const bot = require('rss-telegram-bot')
const config = require('rss-telegram-bot/config')
async function sendSubscribeTag(msg, match) {
    const chatId = msg.chat.id;
    const msgId = msg.message_id;
    const category_id = match[0];

}

bot.onQuery(/^artist:.+$/, sendSubscribeTag);
bot.onQuery(/^group:.+$/, sendSubscribeTag);