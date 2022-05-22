const config = require('rss-telegram-bot/config')
const conf_prefix = "EH_FEED_FORMAT";
config.eh_feed_formats = [];
for (let k in process.env) {
    if (k.slice(0, conf_prefix.length) === conf_prefix) {
        config.eh_feed_formats.push(process.env[k]);
    }
}
if (config.eh_feed_formats.length <= 0) {
    config.eh_feed_formats = ["https://rsshub.app/ehentai/tag/%s"];
}

config.eh_unsubscribe_db_path = process.env.EH_UNSUB_DB_PATH || 'db/eh_unsubscribe.json',

module.exports = config