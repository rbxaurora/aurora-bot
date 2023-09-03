<<<<<<< HEAD
﻿const express = require('express');
const app = express();
const mongoose = require('mongoose');
const { Telegraf, session } = require('telegraf');
const { Mongo } = require(`@telegraf/session/mongodb`);
const { message } = require('telegraf/filters');
require('dotenv').config();
const controller = require(`./controller`);

const dayjs = require('dayjs');
require('dayjs/locale/ru');
dayjs.locale('ru');
const timezone = require(`dayjs/plugin/timezone`);
dayjs.extend(timezone);
dayjs.tz.setDefault('Europe/Moscow');

const port = process.env.PORT || 3005;

app.listen(port, () => {
	console.log('Server is listening in port ' + port);
});

mongoose.connect(process.env.DB_PASS);
const Session = require(`./models/Session`);

const bot = new Telegraf(process.env.BOT_TOKEN);

app.get('/', (req, res) => {
	res.send('Bot is working successfully!');
});

const store = Mongo({
	url: process.env.DB_PASS
})

bot.use(session({ store }));

bot.start((ctx) => controller.hello(ctx));
bot.hears(/\.мут (.+)/, (ctx) => controller.mute(ctx));
bot.hears(/\.размут/, (ctx) => controller.unmute(ctx));
bot.hears(/\выпить чаю/, (ctx) => controller.tea(ctx));
bot.hears(/\чайный топ/, (ctx) => controller.teaTop(ctx));
bot.hears(/\.варн (.+)/, (ctx) => controller.warn(ctx));
bot.hears(/\.вареник (.+)/, (ctx) => controller.warn(ctx));
bot.hears(/\.варны/, (ctx) => controller.allwarns(ctx));
bot.hears(/\.снять варны/, (ctx) => controller.clearWarns(ctx));
bot.hears(/\кто админ/, (ctx) => controller.adminList(ctx));
bot.hears(/\.планировщик старт/, (ctx) => controller.cron(ctx));
bot.command("send", (ctx) => controller.send(ctx));
bot.hears(/\.бан (.+)/, (ctx) => controller.ban(ctx));
bot.hears(/\.съёмки (.+)/, (ctx) => controller.pinMsg(ctx));
bot.on(message('text'), async (ctx) => {
	const chatId = ctx.message.chat.id;

	const session = await Session.findOne({ key: `${chatId}:${chatId}` });

	if (session) {
		controller.saveAnswerNotGo(ctx);
	}
});
bot.on('new_chat_member', (ctx) => controller.newMember(ctx));
bot.on('left_chat_member', (ctx) => controller.leftMember(ctx));
bot.on(message('photo'), (ctx) => controller.dismiss(ctx));
bot.on(message('video'), (ctx) => controller.dismiss(ctx));


bot.launch();
=======
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const { Telegraf, session } = require('telegraf');
const { Mongo } = require(`@telegraf/session/mongodb`);
const { message } = require('telegraf/filters');
require('dotenv').config();
const controller = require(`./controller`);

const dayjs = require('dayjs');
require('dayjs/locale/ru');
dayjs.locale('ru');

const port = process.env.PORT || 3005;

app.listen(port, () => {
	console.log('Server is listening in port ' + port);
});

mongoose.connect(process.env.DB_PASS);
const Session = require(`./models/Session`);

const bot = new Telegraf(process.env.BOT_TOKEN);

app.get('/', (req, res) => {
	res.send('Bot is working successfully!');
});

const store = Mongo({
	url: process.env.DB_PASS
})

bot.use(session({ store }));

bot.start((ctx) => controller.hello(ctx));
bot.hears(/\.мут (.+)/, (ctx) => controller.mute(ctx));
bot.hears(/\.размут/, (ctx) => controller.unmute(ctx));
bot.hears(/\выпить чаю/, (ctx) => controller.tea(ctx));
bot.hears(/\чайный топ/, (ctx) => controller.teaTop(ctx));
bot.hears(/\.варн (.+)/, (ctx) => controller.warn(ctx));
bot.hears(/\.вареник (.+)/, (ctx) => controller.warn(ctx));
bot.hears(/\.варны/, (ctx) => controller.allwarns(ctx));
bot.hears(/\.снять варны/, (ctx) => controller.clearWarns(ctx));
bot.hears(/\кто админ/, (ctx) => controller.adminList(ctx));
bot.hears(/\.планировщик старт/, (ctx) => controller.cron(ctx));
bot.command("send", (ctx) => controller.send(ctx));
bot.hears(/\.бан (.+)/, (ctx) => controller.ban(ctx));
bot.hears(/\.съёмки (.+)/, (ctx) => controller.pinMsg(ctx));
bot.on(message('text'), async (ctx) => {
	const chatId = ctx.message.chat.id;

	const session = await Session.findOne({ key: `${chatId}:${chatId}` });

	if (session) {
		controller.saveAnswerNotGo(ctx);
	}
});
bot.on('new_chat_member', (ctx) => controller.newMember(ctx));
bot.on('left_chat_member', (ctx) => controller.leftMember(ctx));
bot.on(message('photo'), (ctx) => controller.dismiss(ctx));
bot.on(message('video'), (ctx) => controller.dismiss(ctx));


bot.launch();
>>>>>>> 7fe6d55ff2fa1ca38214a0bc947977f95de2e5b1
