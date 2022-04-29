const fs = require('fs');
const path = require('path');
const logger = require("rss-telegram-bot/utils/logger");
const config = require("./config");

let db = {}; //主数据库即索引

fs.mkdirSync(path.dirname(config.unsubscribe_db_path), { recursive: true });
try {
    db = JSON.parse(fs.readFileSync(config.unsubscribe_db_path));
} catch (e) {
    logger.warn("Cannot read database", e);
}

function write() {
    return fs.writeFile(config.unsubscribe_db_path, JSON.stringify(db), (err) => {
        if (err) logger.warn("Cannot write database", err);
    });
}


function putTag(tag) {
    db[tag] = true; //新增
    write();
}

function delTag(tag) {
    delete db[tag]; //删除
    write();
}

function getAllTag() {
    let tags = [];
    for (let tag in db) {
        tags.push(tag);
    }
    return tags
}

module.exports = { putTag, delTag, getAllTag }