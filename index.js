const { bot, rss, user } = require('rss-telegram-bot');
const logger = require('rss-telegram-bot/utils/logger');
const config = require('./config');
const db = require('./database');
var util = require('util');
const { search_cats_title_by_feeds } = require('rss-telegram-bot/utils/search');

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
    bot.sendMessage(chatId, `${tag_link(tag)}\nPlease select a category to subscribe:`, {
        parse_mode: 'HTML',
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
        const tag = util.format(tag_format, tag_content);
        db.putTag(tag);
        await sendSubscribeTag(msg, match, tag);
    }
}

function tag_link(tag) {
    let tag_in_link = "https://exhentai.org/tag/" + tag.replace(new RegExp('"', 'g'), '').replace(/\$/, '').replace(/\s/, '+');
    return `<a href="${tag_in_link}">${tag}</a>`
}

function handlerGen(tag_prefix, func) {
    bot.onValidText(RegExp(`^${tag_prefix}:"([^"\\$]+)"$`), func);
    bot.onValidText(RegExp(`^${tag_prefix}:"([^"\\$]+)\\$"$`), func);
    bot.onValidText(RegExp(`^${tag_prefix}:([^"\\$\\s]+)$`), func);
    bot.onValidText(RegExp(`^${tag_prefix}:([^"\\$\\s]+)\\$$`), func);
}

handlerGen('a', handlerFuncGen('artist:"%s$"'));
handlerGen('artist', handlerFuncGen('artist:"%s$"'));
handlerGen('g', handlerFuncGen('group:"%s$"'));
handlerGen('group', handlerFuncGen('group:"%s$"'));

function getEHLink(tag) {
    let feeds = [];
    for (let url_format of config.eh_feed_formats) {
        feeds.push(util.format(url_format, encodeURIComponent(tag)));
    }
    return feeds
}

const schedule = require('node-schedule');
async function sendUnsubscribe() {
    const tags = await db.getAllTag();
    if (tags.length <= 0) return;
    const tag = tags[Math.floor(Math.random() * tags.length)]; //随机选一个返回
    let msg = `You have this unsubscribed tag:\n${tag_link(tag)}\nPlease select a category to subscribe:`;
    let category_ids = await search_cats_title_by_feeds(getEHLink(tag), rss);
    if (category_ids.length > 0) {
        msg = `You have this subscribed link in ${category_ids.join(', ')}:\n${tag_link(tag)}\nPlease select a category to update subscription:`;
    }
    const inline_keyboards = await catInlineKeyboards(tag);
    for (let chatId of user.getChatIds()) {
        bot.sendMessage(chatId, msg, {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: inline_keyboards
            }
        });
    }
}
if (config.unsubscribe_check === "cron") {
    schedule.scheduleJob(config.unsubscribe_check_cron, sendUnsubscribe);
} else {
    bot.on('message', sendUnsubscribe);
}

async function pongInlineKeyboards() {
    const inline_keyboards = [];
    const categories = await rss.getCategories();
    for (let category_id in categories) {
        const title = categories[category_id];
        inline_keyboards.push([{
            text: title,
            switch_inline_query_current_chat: `/subscribe_eh_pong ${category_id} `
        }]);
    }
    return inline_keyboards
}
async function sendPong() {
    const tags = await db.getAllTag();
    let msg = 'No tag saved'
    if (tags.length > 0)
        msg = `There are still ${tags.length} saved tags`
    msg += '\nPlease select a category to start your next subscription'
    const inline_keyboards = await pongInlineKeyboards();
    for (let chatId of user.getChatIds()) {
        bot.sendMessage(chatId, msg, {
            reply_markup: {
                inline_keyboard: inline_keyboards
            }
        });
    }
}

async function sendSubscribe(msg, category_id, tag) {
    const chatId = msg.chat.id;
    const msgId = msg.message_id;
    const category_title = await rss.getCategoryTitle(category_id);
    for (let feed_url of getEHLink(tag)) {
        logger.info(`Subscribing: ${feed_url}`);
        if (('' + category_id) === await rss.isSubscribed(feed_url)) {
            continue;
        }
        const { ok, err } = await rss.subscribeToFeed(category_id, feed_url);
        if (!ok) {
            const inline_keyboards = [[{
                text: 'Retry it',
                switch_inline_query_current_chat: `/subscribe_eh ${category_id} ${tag}`
            }]];
            bot.sendMessage(chatId, `Cannot subscribed to ${category_title}: ${err}`, {
                reply_to_message_id: msgId,
                reply_markup: {
                    inline_keyboard: inline_keyboards
                }
            });
            sendUnsubscribe();
            sendPong();
            return;
        }
    }
    db.delTag(tag);
    bot.sendMessage(chatId, `Subscribed to ${category_title}: ${tag}`, {
        reply_to_message_id: msgId
    });
    sendUnsubscribe();
    sendPong();
}

bot.onQuery(/^\/subscribe_eh ([0-9]+) (artist:"[A-Za-z0-9 ]+\$")$/, async (msg, match) => {
    const category_id = parseInt(match[1]);
    const tag = match[2];
    sendSubscribe(msg, category_id, tag);
});

bot.onQuery(/^\/subscribe_eh ([0-9]+) (group:"[A-Za-z0-9 ]+\$")$/, async (msg, match) => {
    const category_id = parseInt(match[1]);
    const tag = match[2];
    sendSubscribe(msg, category_id, tag);
});

function handlerGenPong(tag_prefix, func) {
    bot.onQuery(RegExp(`^/subscribe_eh_pong ([0-9]+) ${tag_prefix}:"([^"\$]+)"$`), func);
    bot.onQuery(RegExp(`^/subscribe_eh_pong ([0-9]+) ${tag_prefix}:"([^"\$]+)\$"$`), func);
    bot.onQuery(RegExp(`^/subscribe_eh_pong ([0-9]+) ${tag_prefix}:([^"\$\s]+)$`), func);
    bot.onQuery(RegExp(`^/subscribe_eh_pong ([0-9]+) ${tag_prefix}:([^"\$\s]+)\$$`), func);
}
function handlerFuncGen(tag_format) {
    return async function (msg, match) {
        if (match.length <= 1 || match[2] === null || match[2].length <= 0) {
            return
        }
        const category_id = parseInt(match[1]);
        const tag_content = match[2];
        const tag = util.format(tag_format, tag_content);
        db.putTag(tag);
        await sendSubscribe(msg, category_id, tag);
    }
}
handlerGenPong('a', handlerFuncGen('artist:"%s$"'));
handlerGenPong('artist', handlerFuncGen('artist:"%s$"'));
handlerGenPong('g', handlerFuncGen('group:"%s$"'));
handlerGenPong('group', handlerFuncGen('group:"%s$"'));

bot.onPing(async (msg) => {
    const chatId = msg.chat.id;
    const msgId = msg.message_id;
    const urls = await db.getAllTag();
    bot.sendMessage(chatId, `pong! I have saved ${urls.length} tags.\nPlease select a category to start your tag subscribing`, {
        reply_to_message_id: msgId,
        reply_markup: {
            inline_keyboard: await pongInlineKeyboards()
        }
    })
})