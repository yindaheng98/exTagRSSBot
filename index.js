const { bot, rss, user } = require('rss-telegram-bot')
const config = require('./config')
var util = require('util');

async function catInlineKeyboards(tag) {
    const inline_keyboards = [];
    const categories = await rss.getCategories();
    for (let category_id in categories) {
        const title = categories[category_id];
        inline_keyboards.push([{
            text: title,
            switch_inline_query_current_chat: `/subscribe_eh ${category_id} ${tag}`
        }]);
    }
    inline_keyboards.push([{
        text: 'Cancel it',
        switch_inline_query_current_chat: `/unparse_eh ${tag}`
    }]);
    return inline_keyboards
}

async function sendSubscribeTag(msg, match, tag) {
    if (match.length <= 0 || match[1] === null || match[1].length <= 0) {
        return
    }
    const chatId = msg.chat.id;
    const msgId = msg.message_id;
    bot.sendMessage(chatId, `${tag}\nPlease select a category to subscribe:`, {
        reply_to_message_id: msgId,
        reply_markup: {
            inline_keyboard: await catInlineKeyboards(tag)
        }
    });
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