const Telegraf = require('telegraf');
const commandArgsMiddleware = require('./commandArgs');
const {
    Extra,
    Markup
} = require('telegraf');
const moment = require('moment');
const config = require('./config');
const dataService = require('./dataService');

const bot = new Telegraf(config.botToken);
const helpMsg = `Руководство пользователя:
/regstart - объявляется начало регистрации, старые данные стираются [Админ]
/regme - регистрация на указаное время, пример: /regme 01-00, /regme 1, /regme 01:00
/reguser - регистрация пользователя в ручную, пример: /reguser @Vasya 01:00 [Админ]
/unregme - отмена регистрации, прмер: /unregme 2:00
/unreguser - отмена регистрации пользователя в ручную, /unreguser @Vasya 2:00 [Админ]
/help - вывод этого руководства

WarDragonsTeam Bot v0.1 beta by businessDuck
`;

bot.use(commandArgsMiddleware);

bot.telegram.getMe().then((botInfo) => {
    bot.options.username = botInfo.username;
    console.log("Initialized", botInfo.username);
});

function isAdmin(chatId, userId) {
    return bot.telegram.getChatAdministrators((chatId)).then(adminList => {
        return !!adminList.find(ctx => ctx.user.id === userId);
    });
}

function getUserName(userData) {
    if (!userData.username) {
        return false;
    }
    return `${userData.username}`;
}

function validateDate(date) {
    return date.match(/(\d{2}[:-]00)|(\d[:-]00)|(^\d{1,2}$)/);
}

bot.command('help', ctx => {
    ctx.reply(helpMsg);
});

bot.command('regstart', ctx => {
    isAdmin(ctx.chat.id, ctx.from.id).then(isAdmin => {
        if (isAdmin) {
            ctx.reply("Объявлено начало регистрации");
            dataService.initTimeSet(ctx.chat.id);
        } else {
            ctx.reply("Команда доступна только администраторам");
        }
    });
});

bot.command('regme', ctx => {
    const date = ctx.state.command.args[0] || "";
    const match = validateDate(date);

    if (!match) {

        return ctx.reply(`
            Неверный формат даты. (Допустимые форматы : 12:00, 12, 12-00) \n/help для подробной информации
        `);
    }

    const [hours, minutes = '00'] = match[0].split(/[:-]/);
    const regTime = moment().set({hours, minutes}).format("HH:mm");
    const userName = getUserName(ctx.from);

    if (!userName) {
        return ctx.reply(`Для работы с ботом, пожалуйста укажите ваш никнейм в настройках telegram`);
    }

    if (dataService.isRegistered(ctx.chat.id, regTime, userName)) {
        return ctx.reply(`Вы уже зарегистрированы на ${regTime}`);
    }

    dataService.registerUser(ctx.chat.id, regTime, getUserName(ctx.from));
    ctx.reply(`@${userName} зарегистрирован на ${regTime}`);
});

bot.command('unregme', ctx => {
    const date = ctx.state.command.args[0] || "";
    const match = validateDate(date);

    if (!match) {

        return ctx.reply(`
            Неверный формат даты. (Допустимые форматы : 12:00, 12, 12-00) \n/help для подробной информации
        `);
    }

    const [hours, minutes = '00'] = match[0].split(/[:-]/);
    const regTime = moment().set({hours, minutes}).format("HH:mm");
    const userName = getUserName(ctx.from);

    if (!userName) {
        return ctx.reply(`Для работы с ботом, пожалуйста укажите ваш никнейм в настройках telegram`);
    }

    if (dataService.unregisterUser(ctx.chat.id, regTime, getUserName(ctx.from))) {
        return ctx.reply(`@${userName}, регистрация на ${regTime} отменена`);
    }

    return ctx.reply(`Вы не регистрировались на ${regTime}`);
});

bot.command('reguser', ctx => {
    isAdmin(ctx.chat.id, ctx.from.id).then(isAdmin => {
        if (!isAdmin) {
            ctx.reply("Команда доступна только администраторам");
        }
        let [userName, date = ""] = ctx.state.command.args;
        const match = validateDate(date);
        if (!userName.match(/^@/)) {
            return ctx.reply(`Неверно указан пользователь, используйте символ @ для указания пользователя`);
        }
        userName = userName.replace(/^@/, "");
        if (!match) {
            return ctx.reply(`
            Неверный формат даты. (Допустимые форматы : 12:00, 12, 12-00) \n/help для подробной информации
        `);
        }

        const [hours, minutes = '00'] = match[0].split(/[:-]/);
        const regTime = moment().set({hours, minutes}).format("HH:mm");
        if (dataService.isRegistered(ctx.chat.id, regTime, userName)) {
            return ctx.reply(`Пользователь ${userName} уже зарегистрирован на ${regTime}`);
        }

        dataService.registerUser(ctx.chat.id, regTime, userName);
        ctx.reply(`@${userName} был зарегистрирован на ${regTime}`);
    });
});

bot.command('unreguser', ctx => {
    isAdmin(ctx.chat.id, ctx.from.id).then(isAdmin => {
        if (!isAdmin) {
            ctx.reply("Команда доступна только администраторам");
        }

        let [userName, date = ""] = ctx.state.command.args;
        const match = validateDate(date);
        if (!userName.match(/^@/)) {
            return ctx.reply(`Неверно указан пользователь, используйте символ @ для указания пользователя`);
        }
        userName = userName.replace(/^@/, "");
        if (!match) {
            return ctx.reply(`
            Неверный формат даты. (Допустимые форматы : 12:00, 12, 12-00) \n/help для подробной информации
        `);
        }

        const [hours, minutes = '00'] = match[0].split(/[:-]/);
        const regTime = moment().set({hours, minutes}).format("HH:mm");
        if (dataService.unregisterUser(ctx.chat.id, regTime, userName)) {
            ctx.reply(`@${userName} был зарегистрирован на ${regTime}`);
        } else {
            ctx.reply(`Пользователь ${userName} не регистрировался на ${regTime}`);
        }
    });
});

bot.command('reglist', ctx => {
    ctx.reply(dataService.getRegList(ctx.chat.id));
});

bot.startPolling();


module.exports = {};
