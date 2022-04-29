const bot = require('rss-telegram-bot')
const config = require('rss-telegram-bot/config')
var util = require('util');

config.eh_feed_format = process.env.TH_FEED_FORMAT || "https://rsshub.app/ehentai/tag/%s";

async function sendSubscribeTag(msg, match, tag) {
    const chatId = msg.chat.id;
    const msgId = msg.message_id;
    if (match.length <= 0 || match[1] === null || match[1].length <= 0) {
        return
    }
    const feed_url = util.format(config.eh_feed_format, tag);
    console.log(feed_url);
}

function handlerFuncGen(tag_format) {
    return async function (msg, match) {
        if (match.length <= 0 || match[1] === null || match[1].length <= 0) {
            return
        }
        let tag_content = match[1];
        tag_content = tag_content.replace(" ", "+")
       await sendSubscribeTag(msg, match, util.format(tag_format, tag_content))
    }
}

function handlerGen(tag_prefix, func) {
    bot.onText(RegExp(`^${tag_prefix}:"([^"\\$]+)"$`), func);
    bot.onText(RegExp(`^${tag_prefix}:"([^"\\$]+)\\$"$`), func);
    bot.onText(RegExp(`^${tag_prefix}:([^"\\$\\s]+)$`), func);
    bot.onText(RegExp(`^${tag_prefix}:([^"\\$\\s]+)\\$$`), func);
}

handlerGen('a', handlerFuncGen('artist:"%s$"'));
handlerGen('artist', handlerFuncGen('artist:"%s$"'));
handlerGen('g', handlerFuncGen('group:"%s$"'));
handlerGen('group', handlerFuncGen('group:"%s$"'));