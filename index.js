const bot = require('rss-telegram-bot')
const config = require('rss-telegram-bot/config')
async function sendSubscribeTag(msg, match) {
    const chatId = msg.chat.id;
    const msgId = msg.message_id;
    const tag = match[0];
    console.log(match);
}

function convient(tag_prefix, func) {
    bot.onText(RegExp(`^${tag_prefix}:"([^"\\$]+)"$`), func);
    bot.onText(RegExp(`^${tag_prefix}:"([^"\\$]+)\\$"$`), func);
    bot.onText(RegExp(`^${tag_prefix}:([^"\\$\\s]+)$`), func);
    bot.onText(RegExp(`^${tag_prefix}:([^"\\$\\s]+)\\$$`), func);
}

convient('a', sendSubscribeTag);
convient('artist', sendSubscribeTag);
convient('g', sendSubscribeTag);
convient('group', sendSubscribeTag);