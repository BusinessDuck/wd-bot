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

function registerUser(chatId, time, username, update = false) {
    if (!chats[chatId]) {
        return false;
    }
    const timeSetLocal = chats[chatId]["timeSet"][time];

    if (update) {
        chats[chatId]["timeSet"] = forEach(chats[chatId]["timeSet"], time => {
            const index = time.indexOf(username);
            if (index >= 0) {
                time.splice(index, 1);
            }
        })
    }

    if (timeSetLocal && timeSetLocal.push) {
        timeSetLocal.push(username.toLowerCase());
    }
    saveDb();
}

function isRegistered(chatId, username) {
    if (!chats[chatId]) {
        return false;
    }
    const timeSet = chats[chatId]["timeSet"];

    return values(timeSet).find(userlist => userlist.includes(username));
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
    isRegistered
};
