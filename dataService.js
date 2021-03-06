const fs = require('fs');
const dbFileName = "./db.json";
const {values, forEach} = require('lodash');
let chats = {};
let fileLocked = false;

fs.readFile(dbFileName, (err, data) => {
    if (err) throw err;
    chats = JSON.parse(data);
});

function saveDb() {
    if (!fileLocked) {
        fileLocked = true;
        let json = JSON.stringify(chats);
        fs.writeFile(dbFileName, json, 'utf8', function (err) {
            if (err) throw err;
            fileLocked = false;
        })
    }
}

function initTimeSet(chatId) {
    chats[chatId] = {
        "timeSet": {
            "00:00": [],
            "01:00": [],
            "02:00": [],
            "03:00": [],
            "04:00": [],
            "05:00": [],
            "06:00": [],
            "07:00": [],
            "08:00": [],
            "09:00": [],
            "10:00": [],
            "11:00": [],
            "12:00": [],
            "13:00": [],
            "14:00": [],
            "15:00": [],
            "16:00": [],
            "17:00": [],
            "18:00": [],
            "19:00": [],
            "20:00": [],
            "21:00": [],
            "22:00": [],
            "23:00": []
        }
    };
    saveDb();
}

function registerUser(chatId, time, username) {
    if (!chats[chatId]) {
        return false;
    }
    const timeSetLocal = chats[chatId]["timeSet"][time];

    if (timeSetLocal && timeSetLocal.push) {
        timeSetLocal.push(username.toLowerCase());
    }
    saveDb();
}

function unregisterUser(chatId, time, username) {
    const index = chats[chatId]["timeSet"][time].indexOf(username.toLowerCase());
    if (index >= 0) {
        chats[chatId]["timeSet"][time].splice(index, 1);
    }
    saveDb();

    return index >= 0;
}

function isRegistered(chatId, regTime, username) {
    if (!chats[chatId]) {
        return false;
    }

    return chats[chatId]["timeSet"][regTime].indexOf(username.toLowerCase()) >= 0;
}

function getRegList(chatId) {
    const result = [];
    for (const time in chats[chatId]["timeSet"]) {
        result.push(`${time} | ${chats[chatId]["timeSet"][time].join(' ')}`);
    }

    return result.join('\r\n');
}

module.exports = {
    initTimeSet,
    registerUser,
    getRegList,
    unregisterUser,
    isRegistered
};
