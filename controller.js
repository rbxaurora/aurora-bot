const Tea = require('./models/Tea');
const User = require('./models/User');
const dayjs = require('dayjs');
const Msg = require(`./models/Message`);
const Session = require(`./models/Session`);
const Delmess = require('./models/Delmess');
const CronJob = require(`cron`).CronJob;

let delmess;
let counter = 1;

class controller {
	async mute (ctx) {
		if (ctx.message.reply_to_message) {
            const chatId = ctx.message.chat.id;
            const userId = ctx.message.reply_to_message.from.id;
            const userName = ctx.message.reply_to_message.from.first_name;
            const resp = ctx.match[1].split(` `)[0];
            const eqPos = Number(resp.length + 1);
            const time = this.minToUnix(resp);
            const untilDate = Math.floor((Date.now() + time) / 1000);
            const textMessage = ctx.match[1].substr(eqPos);

            const admin = await User.findOne({ auroraID: ctx.message.from.id });

            if (admin && (admin.role == `OWNER` || admin.role == `DEPUTY`)) {
                if (time) {
                    ctx.telegram.sendMessage(chatId, `Участник <i>${userName}</i> [${userId}] <b>был обеззвучен 🔇 на ${time / 60000} минут администратором Хауса ${ctx.message.from.first_name}</b>. \n\n<i>Причина: ${textMessage}</i>`, {
                        parse_mode: 'HTML'
                    });
                } else {
                    ctx.telegram.sendMessage(chatId, `Участник <i>${userName}</i> [${userId}] <b>был обеззвучен 🔇 администратором Хауса ${ctx.message.from.first_name}</b>. \n\n<i>Причина: ${textMessage}</i>`, {
                        parse_mode: 'HTML'
                    });
                }

                ctx.telegram.restrictChatMember(chatId, userId, {
                    can_send_message: false,
                    until_date: untilDate
                });
            } else {
                ctx.telegram.sendMessage(chatId, `❌<b>У вас нет полномочий на использование данной команды. Пожалуйста, обратитесь к администрации.</b>`, {
                    parse_mode: 'HTML'
                });
            }
        }
	}

    minToUnix(resp) {
        if (resp.includes('м')) {
            const time = Number(resp.replace('м', '') * 60000);
            return time;
        }
    }

    async unmute (ctx) {
        if (ctx.message.reply_to_message) {
            const chatId = ctx.message.chat.id;
            const userId = ctx.message.reply_to_message.from.id;
            const userName = ctx.message.reply_to_message.from.first_name;

            const admin = await User.findOne({ auroraID: ctx.message.from.id });

            if (admin && (admin.role == `OWNER` || admin.role == `DEPUTY`)) {
                ctx.telegram.sendMessage(chatId, `✅Участник <i>${userName}</i> [${userId}] <b>получил право говорить в беседе.</b>\n\n<i>Пожалуйста, впредь не нарушайте правила Хауса😉</i>`, {
                    parse_mode: 'HTML'
                });

                ctx.telegram.restrictChatMember(chatId, userId, {
                    can_send_message: true,
                    can_send_audios: true,
                    can_send_documents: true,
                    can_send_photos: true,
                    can_send_videos: true,
                    can_send_video_notes: true,
                    can_send_voice_notes: true,
                    can_send_polls: true,
                    can_send_other_messages: true,
                    can_add_web_page_previews: true
                });
            } else {
                ctx.telegram.sendMessage(chatId, `❌<b>У вас нет полномочий на использование данной команды. Пожалуйста, обратитесь к администрации.</b>`, {
                    parse_mode: 'HTML'
                });
            }
        }
    }

    async tea (ctx) {
        const chatId = ctx.message.chat.id;
        const userId = ctx.message.from.id;
        const userName = ctx.message.from.first_name;
        const thisTime = Math.floor(Date.now() / 1000);

        const drank = this.randomTea();

        let user = await Tea.findOne({ auroraID: userId });

        if (!user) {
            const tea = new Tea({
                username: userName,
                auroraID: userId,
                attempt: 1,
                untilDate: 0,
                total: drank
            });

            await tea.save();
        } else {
            if (user.attempt < 3 && thisTime >= user.untilDate) {
                await Tea.updateOne({ auroraID: userId }, { $set: { username: userName, untilDate: 0 } });
                await Tea.updateOne({ auroraID: userId }, { $inc: { total: drank, attempt: 1 } });

                user = await Tea.findOne({ auroraID: userId });
            
                ctx.telegram.sendMessage(chatId, `🍵<a href="tg://user?id=${userId}">${userName}</a>, <b>ты выпил(-а) ${drank} литров чая</b>.\n\n<i>Выпито всего - ${user.total.toFixed(2)} литров.</i>`, {
                    parse_mode: 'HTML'
                });

                if (user.attempt == 3) {
                    const untilDate = Math.floor((Date.now() + 7200000) / 1000);

                    await Tea.updateOne({ username: userName }, { $set: { untilDate: untilDate, attempt: 0 } });

                    let until = untilDate - thisTime;
                    let hours = Math.floor(until / 3600);
                    let minutes = Math.round(until / 120);

                    ctx.telegram.sendMessage(chatId, `<b>❗Вы исчерпали свой лимит глотков чая.</b>\nСледующий глоток можно будет сделать через ${hours} часа 00 минут`, {
                        parse_mode: 'HTML'
                    }); 

                }
            } else if (user.untilDate > 0) {
                let until = user.untilDate - thisTime;
                let hours = Math.floor(until / 3600);
                let minutes = Math.round(until / 120);

                if (hours == 1) {
                    ctx.telegram.sendMessage(chatId, `<b>❗Вы исчерпали свой лимит глотков чая.</b>\nСледующий глоток можно будет сделать через ${hours} час ${minutes} минут`, {
                        parse_mode: 'HTML'
                    });
                } else if (hours == 0) {
                    ctx.telegram.sendMessage(chatId, `<b>❗Вы исчерпали свой лимит глотков чая.</b>\nСледующий глоток можно будет сделать через ${minutes} минут`, {
                        parse_mode: 'HTML'
                    });
                } 
            }
        }
    }

    randomTea () {
        let drink = Math.random() * 10;
        return drink.toFixed(2);
    }

    async teaTop (ctx) {
        const chatId = ctx.message.chat.id;
        let top = `<b>📊ТОП 15 ЛЮБИТЕЛЕЙ ЧАЯ</b>\n`;
        let total = 0;
        const teas = await Tea.find({}).sort({ total: -1 }).limit(15);

        for (let i = 0; i < teas.length; i++) {
            const tea = teas[i];
            total = total + Number(tea.total.toFixed(2));
            top += `\n${i+1}. ${tea.username} - ${tea.total.toFixed(2)} литров`;
        }
        top += `\n\n<i>Всего литров выпито - ${total.toFixed(2)}</i>`;

        ctx.telegram.sendMessage(chatId, top, {
            parse_mode: 'HTML'
        });
    }

    async warn (ctx) {
        if (ctx.message.reply_to_message) {
            const chatId = ctx.message.chat.id;
            const userId = ctx.message.reply_to_message.from.id;
            const userName = ctx.message.reply_to_message.from.first_name;
            const resp = ctx.match[1];

            const admin = await User.findOne({ auroraID: ctx.message.from.id });

            if (admin && (admin.role == `OWNER` || admin.role == `DEPUTY`)) {
                let user = await User.findOne({ auroraID: userId });

                if (!user) {
                    const user = new User({
                        name: userName,
                        auroraID: userId,
                        warns: {
                            total: 1,
                            reasons: [resp]
                        }
                    });

                    await user.save();
                } else {
                    await User.updateOne({
                        auroraID: userId
                    }, {
                        $inc: {
                            "warns.total": 1
                        },
                        $push: {
                            "warns.reasons": resp
                        }
                    });
                }

                user = await User.findOne({ auroraID: userId });

                if (user.warns.total <= 5) {
                    ctx.telegram.sendMessage(chatId, `❗Участник <i>${userName}</i> [${userId}] <b>получил ${user.warns.total}</b> предупреждение из 6.\nВыдано администратором Хауса ${ctx.message.from.first_name}\n\n<i>Причина: ${user.warns.reasons[user.warns.total - 1]}</i>`, {
                        parse_mode: 'HTML'
                    });
                } else if (user.warns.total = 6) {
                    ctx.telegram.banChatMember(chatId, userId);
                    ctx.telegram.sendMessage(chatId, `⛔Участник <i>${userName}</i> [${userId}] <b>был исключен из Хауса с последующим занесением в Черный список администратором ${ctx.message.from.first_name}</b>\n\n<i>Причина: Превышено количество предупреждений</i>`, {
                        parse_mode: 'HTML'
                    });

                    await User.deleteOne({ auroraId: userId });
                }
            } else {
                ctx.telegram.sendMessage(chatId, `❌<b>У вас нет полномочий на использование данной команды. Пожалуйста, обратитесь к администрации.</b>`, {
                    parse_mode: 'HTML'
                });
            }
        }
    }

    async allwarns (ctx) {
        if (ctx.message.reply_to_message) {
            const chatId = ctx.message.chat.id;
            const userId = ctx.message.reply_to_message.from.id;
            const userName = ctx.message.reply_to_message.from.first_name;
            
            const user = await User.findOne({ auroraID: userId });

            if (!user) {
                return ctx.telegram.sendMessage(chatId, '❌Данного пользователя не существует в базе данных участников AURORA TEAM.');
            }

            const warns = user.warns;

            let warnList = `<b>📋Список предупреждений участника</b>\n${userName} - [${userId}]\n`;

            if (!warns || warns.total == 0) {
                warnList += `\n<i>У данного участника не имеется предупреждений.</i>`;
                return ctx.telegram.sendMessage(chatId, warnList, {
                    parse_mode: 'HTML'
                });
            }

            for (let i = 0; i < warns.total; i++) {
                const warn = warns.reasons[i];
                warnList += `\n${i + 1}. <i>${warn}</i>`;
            }
            return ctx.telegram.sendMessage(chatId, warnList, {
                parse_mode: 'HTML'
            })

        }
    }

    async clearWarns (ctx) {
        if (ctx.message.reply_to_message) {
            const chatId = ctx.message.chat.id;
            const userId = ctx.message.reply_to_message.from.id;
            const userName = ctx.message.reply_to_message.from.first_name;

            const admin = await User.findOne({ auroraID: ctx.message.from.id });

            if (!admin) {
                return ctx.telegram.sendMessage(chatId, '❌<b>У вас нет полномочий на использование данной команды. Пожалуйста, обратитесь к администрации.</b>' ,{
                    parse_mode: 'HTML'
                })
            }

            const user = await User.findOne({ auroraID: userId });

            if (!user.warns) {
                return ctx.telegram.sendMessage(chatId, `❌У данного участника отсутствуют предупреждения. Выполнение данной команды невозможно.`);
            }

            await User.updateOne({ auroraID: userId }, {
                $unset: {
                    warns: ""
                }
            });
            ctx.telegram.sendMessage(chatId, `✅Администратор <i>${ctx.message.from.first_name}</i> <b>снял все предупреждения с участника Хауса - ${userName}</b>`, {
                parse_mode: 'HTML'
            });
        }
    }

    async send (ctx) {
        if (ctx.message.reply_to_message && ctx.message.text == `/send`) {
            const chatId = process.env.CHAT_ID;
            const resp = ctx.message.reply_to_message.text;

            const admin = await User.findOne({ auroraID: ctx.message.from.id });

            if (admin && (admin.role == `OWNER` || admin.role == `DEPUTY`)) {
                ctx.telegram.sendMessage(chatId, resp);
            } else {
                ctx.telegram.sendMessage(chatId, `❌<b>У вас нет полномочий на использование данной команды. Пожалуйста, обратитесь к администрации.</b>`, {
                    parse_mode: 'HTML'
                });
            }
        }
    }

    async ban (ctx) {
        if (ctx.message.reply_to_message) {
            const chatId = ctx.message.chat.id;
            const userId = ctx.message.reply_to_message.from.id;
            const userName = ctx.message.reply_to_message.from.first_name;
            const resp = ctx.match[1];

            const admin = await User.findOne({ auroraID: ctx.message.from.id });

            if (!admin || admin.role == 'SPECTATOR') {
                return ctx.telegram.sendMessage(chatId, `❌<b>У вас нет полномочий на использование данной команды. Пожалуйста, обратитесь к администрации.</b>`, {
                    parse_mode: 'HTML'
                });
            }

            const user = await User.findOne({ auroraID: userId });

            if (user.isAdmin) {
                return ctx.telegram.sendMessage(chatId, `<b>❌Вы не можете исключить пользователя, состоящего в Администрации чата. Пожалуйста, обратитесь к Создателю Хауса.</b>`, {
                    parse_mode: 'HTML'
                });
            }

            ctx.telegram.banChatMember(chatId, userId);
            return ctx.telegram.sendMessage(chatId, `⛔Участник <i>${userName}</i> [${userId}] <b>был исключен с последующим занесением в Черный список Хауса.</b>\nВыдано администратором Хауса - ${ctx.message.from.first_name}\n\n<i>Причина: ${resp}</i>`, {
                parse_mode: 'HTML'
            });
        }
    }

    async pinMsg (ctx) {
        const chatId = process.env.CHAT_ID;
        const userId = ctx.message.from.id;
        const resp = ctx.match[1];
        const date = resp.split(` `)[0];
        const time = resp.split(` `)[1];
        let when;

        const admin = await User.findOne({ auroraID: userId });

        if (!admin || admin.role == 'SPECTATOR' || admin.role == 'DEPUTY') {
            return ctx.telegram.sendMessage(chatId, `❌<b>У вас нет полномочий на использование данной команды. Пожалуйста, обратитесь к администрации.</b>`, {
                parse_mode: 'HTML'
            });
        }

        if (date == 'Завтра') {
            when = dayjs().hour(24).format('DD MMMM');
        } else if (date == 'Сегодня') {
            when = dayjs().format('DD MMMM');
        }

        const res = await ctx.telegram.sendMessage(chatId, `<b>‼Уважаемые участники AURORA TEAM‼</b>\n\n${date}, ${when}, состоится видеосъемка в ${time} по Московскому времени.\n\n📋Отсутствие на съемках без уважительной причины не допускается!\n\n<i>❓Если Вы не можете прийти на сьемки по уважительной причине, нажмите на кнопку ниже, чтобы указать причину отсутствия.</i>\n\n📋СПИСОК ОТСУТСТВУЮЩИХ\n`, {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: "😔Не могу прийти",
                        url: "https://t.me/testAuroraTeamBot?start=not_go"
                    }]
                ]
            }
        });

        const msg = new Msg ({
            message_id: res.message_id,
            text: res.text,
            entities: res.entities
        });
        await msg.save();

        return ctx.telegram.pinChatMessage(chatId, res.message_id);
    }

    async hello (ctx) {
        if (ctx.startPayload == 'not_go') {
            const chatId = ctx.message.chat.id;

            ctx.session = {
                user_id: chatId,
                payload: 'not_go'
            };

            return ctx.telegram.sendMessage(chatId, '<b>‼Пожалуйста, укажите, почему Вас не будет на сьемках?</b>\nУкажите краткую причину Вашего отсутствия на сьемках.', {
                parse_mode: 'HTML'
            });
        }
    }

    async saveAnswerNotGo (ctx) {
        const chatId = ctx.message.chat.id;
        const answer = ctx.message.text;
        const userName = ctx.message.chat.first_name;

        const session = await Session.findOne({ key: `${chatId}:${chatId}` });

        const message = await Msg.findOne();

        let text = message.text;
        text += `\n${userName} - ${answer}`;

        await Msg.updateOne({ _id: message._id }, { $set: { text: text } });

        await Session.deleteOne({ key: `${chatId}:${chatId}` });

        ctx.telegram.sendMessage(chatId, `<b>✔Ваш ответ будет учтен при составлении списка Реестра съемок.</b> Хорошего дня!`, {
            parse_mode: 'HTML'
        });

        return ctx.telegram.editMessageText(process.env.CHAT_ID, message.message_id, undefined, text, {
            entities: message.entities,
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: "😔Не могу прийти",
                        url: "https://t.me/testAuroraTeamBot?start=not_go"
                    }]
                ]
            }
        });
    }

    async adminList (ctx) {
        const chatId = ctx.message.chat.id;
        console.log(chatId);
        let adminList = `<b>⚜АДМИНИСТРАЦИЯ ХАУСА</b>\n\n`;

        getOwner();

        async function getOwner() {
            const owner = await User.findOne({ role: 'OWNER' });

            const ownerRole = await ctx.telegram.getChatMember(chatId, owner.auroraID);

            adminList += `👑<b>Создатель Хауса</b>\n└ ${owner.name} » <i>${ownerRole.custom_title}</i>\n\n`;
            getDeputies();
        }

        async function getDeputies() {
            adminList += `⚜<b>Заместители Создателя</b>\n`;
            const deputies = await User.find({ role: 'DEPUTY' });

            for (let i = 0; i <= deputies.length; i++) {
                const deputy = deputies[i];

                const deputyRole = await ctx.telegram.getChatMember(chatId, deputy.auroraID);
                adminList += `└ ${deputy.name} » <i>${deputyRole.custom_title}</i>\n`;
            }

            adminList += `\n`;
            getSpectators();
        }

        async function getSpectators() {
            adminList += `👮‍♀️<b>Заместители Создателя</b>\n`;
            const spectators = await User.findOne({ role: 'SPECTATOR' });

            for (let i = 0; i <= spectators.length; i++) {
                const spectator = spectators[i];

                const specRole = await ctx.telegram.getChatMember(chatId, spectator.auroraID);
                adminList += `└ ${spectator.name} » <i>${specRole.custom_title}</i>\n`;
            }

            returnAdmins();
        }

        function returnAdmins () {
            return ctx.telegram.sendMessage(chatId, adminList, {
                parse_mode: 'HTML'
            });
        }
    }

    async newMember (ctx) {
        const chatId = ctx.message.chat.id;
        const userId = ctx.message.new_chat_members[0].id;
        const userName = ctx.message.new_chat_members[0].first_name;
        const chat = await ctx.telegram.getChat(chatId);
      
        if (!ctx.message.new_chat_members[0].is_bot) {
            ctx.telegram.sendMessage(
                chatId,
                `<b>Привет, <a href="tg://user?id=${userId}">${userName}</a>, добро пожаловать в ${chat.title}</b>\n\nДобро пожаловать в нашу команду!\nПожалуйста, ознакомься с правилами нашего Хауса. Со всеми вопросами ты всегда можешь обратиться к нашим многоуважаемым администраторам. \n\n<i>Надеемся, что тебе тут будет комфортно и весело❤</i>`,
                {
                  reply_markup: {
                    inline_keyboard: [
                      [
                        {
                          text: "ℹПравила Хауса",
                          url: "https://rbxaurora.github.io/for-members/rules.html"
                        },
                      ],
                    ],
                  },
                  parse_mode: 'HTML'
                }
            );

            const user = new User({
                name: userName,
                auroraID: userId,
                role: 'USER',
                isAdmin: false
            });

            await user.save();
        }
    }

    async leftMember (ctx) {
        const chatId = ctx.message.chat.id;
        const userId = ctx.message.left_chat_member.id;
        const userName = ctx.message.left_chat_member.first_name;
      
        ctx.telegram.sendMessage(
          chatId,
          `🙅🏿‍♂️ <a href="tg://user?id=${userId}">${userName}</a> покинул(-а) чат.`,
          {
            parse_mode: 'HTML',
          }
        );

        await User.deleteOne({ auroraID: userId });
    }

    async dismiss (ctx) {
        const chatId = ctx.message.chat.id;
        const msgId = ctx.message.message_id;
        const userId = ctx.message.from.id;
        const channelName = ctx.message.forward_from_chat?.title;

        if (channelName?.includes('Топор') || channelName?.includes('Труха')) {
            const user = await User.findOne({ auroraID: userId });

            if (!user?.isAdmin) {
                const delmess = new Delmess({
                    msgId: msgId
                });

                await delmess.save();
                await this.delmsg(ctx, chatId, msgId, channelName);
            }
        }
    }

    async delmsg (ctx, chatId, msgId, channelName) {
        await ctx.telegram.deleteMessage(chatId, msgId);

        if (!delmess) {
            delmess = await Delmess.find().sort({ msgId: -1 }).limit(1);

            try {
                setTimeout(() => {
                    delmess = null;
                    this.msgDeleted(ctx, chatId, channelName);
                }, 1200);
            } catch (e) {
            
            }
        } 
    }

    async msgDeleted (ctx, chatId, channelName) {
        if (!delmess && counter != 0) {
            ctx.telegram.sendMessage(chatId, `<b>❌Сообщения из телеграм-канала ${channelName} запрещены в данном чате по правилам Хауса.</b>\n\n<i>Сообщение было удалено.</i>`, {
                parse_mode: 'HTML'
            });
            await Delmess.deleteMany();
            counter--;
        }
    }

    async cron (ctx) {
        const chatId = ctx.message.chat.id;
        ctx.telegram.sendMessage(chatId, `✅Планировщик запущен!`);

        const bday = new CronJob(
            '* * * * *',
            async function() {
                const day = dayjs().format('DD.MM');
                const bday = await User.find({ birthday: day });

                ctx.telegram.sendMessage(chatId, day);

                for (let i = 0; i < bday.length; i++) {
                    const user = bday[i];

                    setTimeout(() => {
                        ctx.telegram.sendPhoto(chatId, 'https://as2.ftcdn.net/v2/jpg/04/76/81/75/1000_F_476817596_dcB5ERJBjdc6nnhyuh9ghl8xaLC05auK.jpg', {
                            caption: `<b>Поздравляем <a href="tg://user?id=${user.auroraID}">${user.name}</a> с днем рождения!🎁</b>\n\nОт имени всего Хауса желаем тебе счастья и здоровья. Стремись к своим целям, несмотря ни на какие трудности. Пусть твои близкие друзья и родственники помогают тебе на протяжении твоего жизненного пути, чтобы каждый день приносил тебе много незабываемых, веселых и счастливых моментов.\n\n--\n<i>С любовью от администрации AURORA TEAM❤</i>`,
                            parse_mode: 'HTML'
                        });
                    }, 1000);
                }
            },
            null,
            true,
            'Europe/Moscow'
        );
    }
}


module.exports = new controller()