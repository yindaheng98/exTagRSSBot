const config = require('rss-telegram-bot/config')
const conf_prefix = "TH_FEED_FORMAT";
config.eh_feed_formats = [];
for (let k in process.env) {
    if (k.slice(0, conf_prefix.length) === conf_prefix) {
        config.eh_feed_formats.push(process.env[k]);
    }
}
if (config.eh_feed_formats.length <= 0) {
    config.eh_feed_formats = ["https://rsshub.app/ehentai/tag/%s"];
}

module.exports = config