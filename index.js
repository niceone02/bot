const { Telegraf, session, Markup, Scenes } = require("telegraf");
const env = require("./src/env");

const bot = new Telegraf(env.bot_token);

//Connect to Mongodb and then Launch Bot:


const mongo = require("./src/functions/mongoClient");
mongo.connect().then(() => {
  bot.launch().then(() => {
    console.log('🤖 The Airdrop is Now Live!!');
    bot.telegram.sendMessage(env.admin, `🤖 I'm now Serving People`);
  });
});

const { db } = require("./src/functions/mongoClient");
const { starter, starterInline } = require('./src/functions/starter');
const { compChnl } = require("./src/commands/channels.js");

const { mathCaptcha } = require("./src/functions/math-captcha.js");
const { adminId, curr, findUser, findUserCallback, sendError, sendInlineError, mustJoin, isNumeric, globalBroadCast } = require("./src/functions/misc.js");

const { stages } = require("./src/helpers/scenes");
const { aPan } = require("./src/panel/admin/admin-panel.js");
const { aScn } = require("./src/panel/admin/adminScene.js");
const withComp = require('./src/commands/withdraw').bot

bot.use(session());
bot.use(stages);
bot.use(withComp);
bot.use(compChnl);
bot.use(aPan);
bot.use(aScn);

const rateLimit = require("telegraf-ratelimit");

const buttonsLimit = {
  window: 1000,
  limit: 1,
  onLimitExceeded: (ctx, next) => {
    if ("callback_query" in ctx.update)
      ctx.answerCbQuery("✋ Don't Press Buttons Quickly , Try Again...", { show_alert: true })
        .catch((err) => sendInlineError(err, ctx));
  },
  keyGenerator: (ctx) => {
    return ctx.callbackQuery ? true : false;
  },
};
bot.use(rateLimit(buttonsLimit));

bot.command('stopbot', ctx => { ctx.scene.enter('notfound') })

function sleep(m) {
  return new Promise((r) => setTimeout(r, m));
}
async function setAdmin(ctx, db) {
  await ctx.reply("✋ Please Wait Setting Up The Bot");
  await sleep(5500);
  let his = await db.collection("admin").find({ group: "admin" }).toArray();
  console.log(`Update Admin Id => ${his[0].adminId} in Db`);
  await ctx.replyWithMarkdown(
    "*🌟 You are Now All Set to Go!*\nAdmin Id: " +
    his[0].adminId +
    "\n\n*/start Again Now*"
  );
  return true;
}
//▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭
const botStart = async (ctx) => {
  try {
    if (ctx.message.chat.type != "private") {
      return;
    }
    let dbData = await db.collection("allUsers").find({ userId: ctx.from.id }).toArray();
    let bDa = await db.collection("vUsers").find({ userId: ctx.from.id }).toArray();
    let Bal = await db.collection("balance").find({ userId: ctx.from.id }).toArray();
    let PendA = await db.collection("pendUsers").find({ userId: ctx.from.id }).toArray();

    const admi = await db.collection("admin").find({ group: "admin" }).toArray();
    if (admi.length === 0) {
      db.collection("admin").insertOne({ group: "admin", adminId: env.admin });
      const bt = await setAdmin(ctx, db);
      if (bt) {
        return
      }
    } else if ("adminId" in admi[0]) {
    } else {
      db.collection("admin").updateOne({ group: "admin" }, { $set: { adminId: env.admin } }, { upsert: true }
      );
      const bt = await setAdmin(ctx, db);
      if (bt) {
        return
      }
    }

    let admin = await adminId();

    if (dbData.length === 0 && bDa.length === 0) {
      if (ctx.startPayload && ctx.startPayload != ctx.from.id && isNumeric(ctx.startPayload)) {
        let ref = ctx.startPayload * 1;
        if (PendA.length === 0) {
          await db.collection("pendUsers").insertOne({ userId: ctx.from.id, inviter: ref });
        }
      } else {
        if (PendA.length === 0) {
          db.collection("pendUsers").insertOne({ userId: ctx.from.id });
        }
      }
      if (dbData.length === 0) {
        let lName = ctx.from.last_name;
        if (!ctx.from.last_name) {
          lName = "null";
        }
        await db.collection("allUsers").insertOne({ userId: ctx.from.id, firstName: ctx.from.first_name, lastName: lName, paid: false, stage: 'new' });
        if (Bal.length === 0) {
          await db.collection("balance").insertOne({ userId: ctx.from.id, balance: 0, withdraw: 0 });
        }
      }
      let tData = await db.collection("allUsers").find({}).toArray();

      let linkk = "<a href='tg://user?id="+ctx.from.id+"'>@"+ctx.from.username+"</a>";
      if (!ctx.from.username) {
        linkk = "<a href='tg://user?id="+ctx.from.id+"'>Click Here</a>";
      }
      await bot.telegram.sendMessage(
        admin,
        `➕ <b>New User Notification ➕</b>\n\n👤<b>User:</b> <a href='tg://user?id=${ctx.from.id}'>${ctx.from.first_name}</a>\n\n🆔 <b>ID :</b> <code>${ctx.from.id}</code>\n\n<b> Link :</b> ${linkk}\n\n🌝 <b>Total User's Count: ${tData.length}</b>`,
        {
          parse_mode: "html"
        }
      );
      mathCaptcha(ctx);
    } else if (bDa.length === 0) {
      mathCaptcha(ctx);
    } else {
      if (ctx.startPayload && ctx.startPayload == ctx.from.id) {
        ctx.reply('🤦‍♂️ <i>Do not Use Your Referral Link Your self, Share it to Your Friends!</i>', { parse_mode: 'html', reply_markup: { inline_keyboard: [[{ text: '🔀 Share Link', url: 'https://t.me/share/url?text=https://t.me/' + ctx.botInfo.username + '?start=' + ctx.from.id }]] } })
      } else if (ctx.startPayload) {
        ctx.reply('🎭 <i>You Were Already Attracted!</i>', { parse_mode: 'html' })
      }
      let joinCheck = await findUser(ctx, db);
      if (joinCheck) {
        let joingDa = await db.collection("joinedUsers").find({ userId: ctx.from.id }).toArray();
        if (joingDa.length === 0) {
          db.collection("joinedUsers").insertOne({ userId: ctx.from.id, join: true, });
        } else {
          db.collection("joinedUsers").updateOne({ userId: ctx.from.id }, { $set: { join: true } }, { upsert: true });
        }
        //ctx.scene.enter('getTweet')
        await starter(ctx);
      } else {
        await mustJoin(ctx, db);
      }
    }
  } catch (err) {
    sendError(err, ctx)
  }
}

bot.start(botStart);

bot.hears(["⬅️ Back", "🔙 back", "⬅️ Return","⛔️ Cancel","🔙 Back"], botStart);
//▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭
async function afterCaptcha(ctx) {
  try {
    let vData = await db.collection("vUsers").find({ userId: ctx.from.id }).toArray();
    if (ctx.from.last_name) {
      valid = ctx.from.first_name + " " + ctx.from.last_name;
    } else {
      valid = ctx.from.first_name;
    }
    if (vData.length === 0) { await db.collection("vUsers").insertOne({ userId: ctx.from.id, name: valid, stage: 'new' }); }
    await ctx.deleteMessage();

    let joinCheck = await findUser(ctx);
    if (joinCheck) {
      let joinDal = await db.collection("joinedUsers").find({ userId: ctx.from.id }).toArray();
      if (joinDal.length === 0) {
        db.collection("joinedUsers").insertOne({ userId: ctx.from.id, join: true, });
      } else {
        db.collection("joinedUsers").updateOne({ userId: ctx.from.id }, { $set: { join: true } }, { upsert: true });
      }
      //ctx.scene.enter("getTweet"); 
      await starter(ctx);
    } else {
      await mustJoin(ctx, db);
    }
  } catch (err) {
    sendInlineError(err, ctx, db);
  }
}
/////////////////////////////////////////////////

bot.action("/joined", async (ctx) => {
  try {

    let bData = await db.collection("vUsers").find({ userId: ctx.from.id }).toArray();

    if (bData.length === 0) {
      return;
    }
    if (ctx.update.callback_query.message.chat.type != "private") {
      ctx.leaveChat();
      return;
    }

    let joinCheck = await findUserCallback(ctx, db);
    if (joinCheck) {
      let joinnDa = await db.collection("joinedUsers").find({ userId: ctx.from.id }).toArray();
      if (joinnDa.length === 0) {
        db.collection("joinedUsers").insertOne({ userId: ctx.callbackQuery.from.id, join: true, });
      } else {
        db.collection("joinedUsers").updateOne({ userId: ctx.callbackQuery.from.id }, { $set: { join: true } }, { upsert: true });
      }
      await ctx.deleteMessage();
      //ctx.scene.enter("getTweet");
      await starter(ctx);

    } else {
      await ctx.deleteMessage();
      await ctx.answerCbQuery("⛔ Must Join All Channels", {
        show_alert: true,
      });
      await mustJoin(ctx, db);
    }
  } catch (err) {
    sendInlineError(err, ctx, db);
  }
});
//▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭
//▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭

bot.command("broadcast", async (ctx) => {
  let admin;
  admin = await adminId();

  if (ctx.from.id == admin) {
    ctx.scene.enter("getMsg");
  }
});
bot.action("/broadcast", async (ctx) => {
  let admin;

  await ctx.answerCbQuery();
  admin = await adminId();
  if (ctx.from.id == admin) {
    ctx.scene.enter("getMsg");
  }
});

//▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭
//▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭
bot.action("/reply",async(ctx)=>{
  ctx.replyWithMarkdown("Enter Message",{
    reply_markup:{
      keyboard:[["⛔ Cancel"]],
resize_keyboard:true
    }
  })
ctx.scene.enter("reply");

})
bot.action("/support",
          ctx =>{
        ctx.reply(
          "*You are now in direct contact with our Administrator*\nSend here any message you want to submit, you will receive the answer directly here in chat!",{parse_mode:"markdown",reply_markup: {keyboard:[["🔙 Back"]],resize_keyboard:true}}
        )    
ctx.scene.enter("getTweet");

          })
bot.hears("📞 Contact Us",
          ctx =>{
        ctx.reply(
          "*You are now in direct contact with our Administrator*\nSend here any message you want to submit, you will receive the answer directly here in chat!",{parse_mode:"markdown",reply_markup: {keyboard:[["🔙  Back"]],resize_keyboard:true}}
        )    
ctx.scene.enter("getTweet");

          })
bot.hears("🔴 Helpdesk",
        ctx => {
          ctx.replyWithMarkdown(`*❓ Are you asking about when you will receive your withdrawal? *
All airdrop will be automatically sent to your wallet on the distribution date. Do not leave the must-join channels to be eligible for the airdrop. 
    
*❓ How to change your wallet address*
Use /setwallet to change it, please complete the tasks before the distribution date. Airdrop will be automatically sent after the date. 
    
If you still need to contact us, please press the button below to send us a message.`,
                                {reply_markup : { keyboard: [["📞 Contact Us"],["🔙 back"]],
                                                resize_keyboard:true}
                                })
        })

bot.hears("🆔 Balance", async (ctx) => {
  try {
    if (ctx.message.chat.type != "private") {
      return;
    }
    var valid = !ctx.from.last_name ? ctx.from.first_name : ctx.from.first_name + " " + ctx.from.last_name;

    const sal = await db.collection("admin").find({ group: "global" }).toArray();
    const inf =
    sal.length === 0 || !sal[0].coininfo
      ? "📵 <i>Currently No Information Found!</i>"
      : sal[0].coininfo;
    let bData = await db.collection("vUsers").find({ userId: ctx.from.id }).toArray();

    if (bData.length === 0) {
      return;
    }
    let joinCheck = await findUser(ctx);
    if (joinCheck) {
      let thisUsersData = await db.collection("balance").find({ userId: ctx.from.id }).toArray();

      let sum = thisUsersData[0].balance;
      const app = await db.collection("admin").findOne({ group: "global" });
      let keyb = [
        ["✅ Airdrop Status"],
        ["🔴 Helpdesk", "🔃 Set Wallet"],
        ["⛔️ Cancel"]
      ]
      if (app.length === 0 || !app?.dailybonus || app?.dailybonus === "0") {
        keyb = [
          ["✅ Airdrop Status"],
          ["🔴 Helpdesk", "🔃 Set Wallet"],
          ["Back 🔙"]
        ]
      }
      
      await ctx.reply(
        `<b>👤 Account Information️</b>

Available for Withdrawal: <b>${sum} ${await curr()}

All withdrawals will be paid out after ${inf} automatically.</b>
      `,
        {
          parse_mode: "html",
          reply_markup: {
            keyboard: keyb,
            resize_keyboard: true,
          }
        }
      );
    } else { await mustJoin(ctx, db); }
  } catch (err) {
    sendError(err, ctx, db);
  }
});
//▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭
//▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭
bot.hears(["🔃 Set Wallet","/setwallet"],
         async(ctx) => {
          var key=  [[{ text: "🚀 Set/Change Wallet 💼", callback_data: "/set" }]]
let wal = await db.collection("allUsers").find({ userId: ctx.from.id }).toArray();
        var wallet = wal[0].address;
           if(wallet == null){
                   await ctx.reply(
             "*💡 Your currently set ETH wallet is : *'`none`'\n\nIt will be used for all future withdrawals.",
             {parse_mode: "markdown",
      reply_markup: { inline_keyboard: key }}
           )
             return;
           }
           
           await ctx.reply(
             "*💡 Your currently set ETH wallet is : *'`"+wallet+"`'\n\nIt will be used for all future withdrawals.",
             {parse_mode: "markdown",
      reply_markup: { inline_keyboard: key }}
           )
         })
bot.action("/set",async (ctx) => {
  try{
    var key = [["⛔ Cancel"]]
   await ctx.deleteMessage();
await ctx.reply("✏️* Send now your "+await curr()+" address to use it in future withdrawals.*\n\n⚠️ _This wallet Will be used for withdrawals !!_",
         {parse_mode:"Markdown",
         reply_markup:{
          keyboard:key,
       resize_keyboard: true}
                })
ctx.scene.enter("getWallet");
  }catch(err){
    sendInlineError(err, ctx, db);
  }
})


bot.hears("💫 CLAIM DAILY 💫", async (ctx) => {
  try {
    if (ctx.message.chat.type != "private") {
      return;
    }

    let bData = await db.collection("vUsers").find({ userId: ctx.from.id }).toArray();
    if (bData.length === 0) {
      return;
    }

    const app = await db.collection("admin").findOne({ group: "global" });
    if (app.length === 0 || !app?.dailybonus || app?.dailybonus === "0") {
      return;
    }
    let joinCheck = await findUser(ctx);
    if (joinCheck) {
      var duration_in_hours;

      var tin = new Date().toISOString();
      let dData = await db.collection("bonusforUsers").find({ userId: ctx.from.id }).toArray();

      if (dData.length === 0) {
        db.collection("bonusforUsers").insertOne({ userId: ctx.from.id, bonus: new Date(), });
        duration_in_hours = 99;
      } else {
        duration_in_hours =
          (new Date() - new Date(dData[0].bonus)) / 1000 / 60 / 60;
      }
      if (duration_in_hours >= 24) {
        let bal = await db.collection("balance").find({ userId: ctx.from.id }).toArray();

        let dBon = app?.dailybonus;
        let ran = dBon;
        let rann = ran * 1;
        var adm = bal[0].balance * 1;
        var addo = adm + rann;

        db.collection("balance").updateOne({ userId: ctx.from.id }, { $set: { balance: addo } }, { upsert: true });

        db.collection("bonusforUsers").updateOne({ userId: ctx.from.id }, { $set: { bonus: tin } }, { upsert: true });

        await ctx.replyWithMarkdown(
          "*🎁 Congratulations \n\n😊 You Received "+dBon +" "+await curr()+" in Daily Bonus*"
        )
        await sleep(2500);
      } else {
        var duration_in_hour = Math.abs(duration_in_hours - 24);
        var hours = Math.floor(duration_in_hour);
        var minutes = Math.floor((duration_in_hour - hours) * 60);
        var seconds = Math.floor(((duration_in_hour - hours) * 60 - minutes) * 60);
        await ctx.replyWithMarkdown(`*⚠️You Already Claimed Bonus In Last 
   
  Remain Time Left -  ${hours} Hour ${minutes} Minutes ${seconds} Seconds \n\n\n🧭 Check-In After 24 Hours*`)
      }
    } else { await mustJoin(ctx, db); }
  } catch (err) {
    sendError(err, ctx)
  }
});
//▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭
//▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭
bot.hears("✅ Airdrop Status",
         async (ctx) => {
           try{
             const bs = db.collection('withdrawals').find({ userId: ctx.from.id }).toArray();
             let x = 0;
    let bp = await bs;

            

    for (var i = 0; i < bp.length; i++) {
      x += bp[i].amount}
let tData = await db.collection("allUsers").find({}).toArray();
             ctx.reply(`<b> This is a statistics of all the ongoing airdrop event. 

Total Participants: </b>
${tData.length}

<b>Total Airdrop Requested: </b>
${x} ${await curr()}

⭐️ Share your /referral link to receive more! 
https://t.me/${ctx.botInfo.username}?start=${ctx.from.id} `, { parse_mode: "html", })
           }catch(err){
             sendError(err, ctx)
           }
         })
bot.hears("🚼 Referral", async (ctx) => {
  try {
    if (ctx.message.chat.type != "private") {
      return;
    }
    let bData = await db.collection("vUsers").find({ userId: ctx.from.id }).toArray();
    if (bData.length === 0) {
      return;
    }
    let joinCheck = await findUser(ctx);
    if (joinCheck) {
      const pre = await db.collection("admin").find({ group: "global" }).toArray();
      const pref = pre.length === 0 || !pre[0].perrefer ? "Not Set" : pre[0].perrefer;
      let allRefs = await db.collection("allUsers").find({ inviter: ctx.from.id }).toArray(); // all invited users
      await ctx.reply(
        `<b>✅ ${await curr()} Airdrop
  
🎁 Total Referrals: ${allRefs.length} User(s)
  
👬 Per Refer: ${pref} ${await curr()}
  
🔗  Your Referral Link :- 
https://t.me/${ctx.botInfo.username}?start=${ctx.from.id}
  </b>
    `, { parse_mode: "html", reply_markup: { inline_keyboard: [[{ text: '📠 Detailed Report', callback_data: '/referreport' }]] } });
    } else { await mustJoin(ctx, db); }
  } catch (err) {
    sendError(err, ctx, db);
  }
});

bot.action('/referreport', async (ctx) => {
  try {
    const cap = await db.collection('allUsers').find({ inviter: ctx.from.id }).toArray();
    let x = "";
    for (var i = 0; i < cap.length; i++) {
      x += "\n"+Math.floor(i + 1)+") <a href='tg://user?id="+cap[i].userId+"'>"+cap[i].firstName+"</a>"
        }
    var msg = (cap.length === 0) ? `📑 Advanced Active Referrals Report
    
    <b> No any Referrals</b>` : `📑<b> Advanced Active Referrals Report</b>${x}
    `
    ctx.reply(msg, { parse_mode: 'html' });
  } catch (err) {
    sendInlineError(err, ctx)
  }
})
//▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭
//▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭

bot.hears(/^\ℹ About/, async (ctx) => {
  try {
    if (ctx.chat.type != "private") {
      return;
    }

    let bData = await db.collection("vUsers").find({ userId: ctx.from.id }).toArray();
    if (bData.length === 0) {
      return;
    }
    let joinCheck = await findUser(ctx);
    if (joinCheck) {
      let update = await db.collection("admin").find({ group: "global" }).toArray();
      if (update.length === 0 || !update[0].coininfo) {
        await ctx
          .reply(`📵 <b>Currently No Information Found!</b>`, {
            parse_mode: "html",
          })
          .catch((err) => {
            sendError(err, ctx);
          });

        return;
      } else {
        await ctx.reply(`${update[0].coininfo}`, {
          parse_mode: "html",
          disable_web_page_preview: true,
        })
      }
    } else { await mustJoin(ctx, db); }
  } catch (err) {
    sendError(err, ctx);
  }
});

//▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭
//▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭
bot.hears("✅ CLAIM FREE",
      async (ctx) => {
var msg = `<b>THIS IS AN ADVERTISEMENT - WE ARE NOT AFFILIATED
🐟 Tron Double Yield Farming
Stake with TRON to claim your very own TRX!</b>
~~~~~~~~~~~
Start yield farming with TRON now!
 link`;
let keybs = [
        ["💫 CLAIM DAILY 💫"],
        ["🔙 back"]]
  try {
ctx.reply(msg, { parse_mode: "html" ,
                      reply_markup: {
            keyboard: keybs,
            resize_keyboard: true,
                      }});
  }catch (err) {
    sendError(err, ctx);
  }
      });


bot.hears("🔝 Top 20 Referrals", async (ctx) => {
  try {
    if (ctx.chat.type != 'private') { return }
    let bData = await db.collection("vUsers").find({ userId: ctx.from.id }).toArray();
    if (bData.length === 0) {
      return;
    }
    let joinCheck = await findUser(ctx);
    if (joinCheck) {
      let ret = [];
      const u = await db.collection("allUsers").find({}).toArray();
      for (var i in u) {
        const r = await db.collection("allUsers").find({ inviter: u[i].userId }).toArray();
        if (r.length === 0) {
        } else {
          ret.push({ userId: u[i].userId, firstName: u[i].firstName, referred: r.length, });
        }
      }
      let aret = ret.sort(function(a, b) {
        return b.referred - a.referred
      });
      let msg = "🔝 <b>Top 20 Referrals List:</b>\n";
      for (var i = 0; i < aret.length; i++) {
        if (i <= 19) {
          msg +=
            "\n" +
            Math.floor(i + 1) +
            ". " +
            aret[i].firstName +
            ": <b>" +
            aret[i].referred +
            "</b> Referral(s)";
        }
      }
      msg +=
        "\n\n🎁 <i>TOP 20 REFERRALS will Get 50 USDT each after the Airdrop Ends</i>";
      if (aret.length === 0) {
        msg = '🎩 <b>Leader Board not Available Due to No Users are Invited yet!</b>'
      }
      ctx.reply(msg, { parse_mode: "html" });
    } else { await mustJoin(ctx, db); }
  } catch (err) {
    sendError(err, ctx);
  }
});

//▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭
bot.hears('⭐️ History', async (ctx) => {
  try {
    const bs = db.collection('withdrawals').find({ userId: ctx.from.id }).toArray();
    let x = "";
    let bp = await bs;
    for (var i = 0; i < bp.length; i++) {
      x += `\n<b>${Math.floor(i+1)}) ${bp[i].amount} ${await curr()}</b>\n⏲️ ${bp[i].time}`
    }
    
    if(x == undefined){
      
      var msg = "<b>💹 No Payments Found </b>"
      ctx.reply(msg, { parse_mode: 'html' });
    }else{
    var msg = '💹 <b>Withdrawal History</b>\n' + x
    ctx.reply(msg, { parse_mode: 'html' });
    }} catch (err) {
    sendError(err, ctx)
  }
})

//▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭

//▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭
//▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭
//▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭

async function adminKey() {
  const b = [
    [{ text: "🪩 Broadcast", callback_data: "/broadcast" }],
    [
      { text: "➕ Add Balance", callback_data: "/add_balance" },
      { text: "✂ Cut Balance", callback_data: "/cut_balance" },
    ],
    [{ text: "🪪 Check User Details", callback_data: "/check_details" }],
    [
      { text: "🔠 Set Coin Name", callback_data: "/set_coinname" },
      { text: "⏰ Set Date", callback_data: "/set_date" },
    ],
    [{ text: "🛟 Manage Channels", callback_data: "/manage_channels" }],
    [
      { text: "👨‍💼 Per Refer " + await curr(), callback_data: "/set_perrefer" },
      { text: "🎁 Daily Bonus", callback_data: "/set_dailybonus" }
    ],
    [{ text: "💸 Minimum Withdraw", callback_data: "/set_minwith" }],
  ];
  return b
}

async function admsg() {

  const sal = await db.collection("admin").find({ group: "global" }).toArray();

  const wit =
    sal.length === 0 || !sal[0].minwithdraw
      ? "Not Set"
      : sal[0].minwithdraw + " " + await curr();

  const bon =
    sal.length === 0 || !sal[0].dailybonus
      ? "Not Set"
      : sal[0].dailybonus + " " + await curr();

  const per =
    sal.length === 0 || !sal[0].perrefer
      ? "Not Set"
      : sal[0].perrefer + " " + await curr();

  const inf =
    sal.length === 0 || !sal[0].coininfo
      ? "📵 <i>Currently No Information Found!</i>"
      : sal[0].coininfo;

  const calll = await db.collection("channels").find({}).toArray();
  const cha = calll.length === 0 ? "0" : calll.length;

  const pc =
    sal.length === 0 || !sal[0].paymentchannel
      ? "Not Set"
      : '@' + sal[0].paymentchannel

  return `
👋 <b>Hello Admin! Welcome to Admin Panel!</b>

🤖 <i><u>Bot Details:</u></i>
👛 <b>Coin Name:</b> ${await curr()}
👬 <b>Per Refer:</b> ${per}
🎁 <b>Daily Bonus:</b> ${bon}
📤 <b>Minimum Withdraw:</b> ${wit}
ℹ <b>Date Info:</b> ${inf}
🅿 <b>Payment Channel:</b> ${pc}
📣 <b>Total Channels Added:</b> ${cha}

🛠 <b>Modify the Details from Below:</b>
`;
}

bot.hears("/admin", async (ctx) => {
  try {
    if (ctx.from.id != (await adminId())) {
      return;
    }
    await ctx.reply(await admsg(), {
      parse_mode: "html",
      reply_markup: { inline_keyboard: await adminKey() },
    });
  } catch (err) {
    sendError(err, ctx);
  }
});
bot.action("/adminn", async (ctx) => {
  try {
    await ctx.answerCbQuery();
    if (ctx.from.id != (await adminId())) {
      return;
    }
    await ctx.editMessageText(await admsg(), {
      parse_mode: "html",
      reply_markup: { inline_keyboard: await adminKey() },
    });
  } catch (err) {
    sendInlineError(err, ctx);
  }
}); //▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭
//▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭
//▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭

bot.action(/.*/, async (ctx) => {
  try {
    var msg = ctx.update.callback_query.data;
    if (/^\/checkMathAnswer/) {
      var correctAnswer = msg.split(" ")[1];
      var userAnswer = msg.split(" ")[2];
      if (userAnswer != correctAnswer) {
        await ctx.answerCbQuery("❗ Wrong Answer ❗", { show_alert: true });
        await ctx.deleteMessage();
        mathCaptcha(ctx);
        return;
      } else {
        await ctx.answerCbQuery("✅ Correct Answer ✅", { show_alert: true });
        await ctx.editMessageText("Please wait.");
        await ctx.editMessageText("Please wait..");
        await ctx.editMessageText("Please wait...");
        await ctx.editMessageText("Please wait....");
        await ctx.editMessageText("✅ *Success!* Wait a Moment.", {
          parse_mode: "markdown",
        });
        await ctx.editMessageText("✅ *Success!* Wait a Moment..", {
          parse_mode: "markdown",
        });
        await ctx.editMessageText("✅ *Success!* Wait a Moment...", {
          parse_mode: "markdown",
        });
        let vData = await db.collection("vUsers").find({ userId: ctx.from.id }).toArray();
        if (ctx.from.last_name) { valid = ctx.from.first_name + " " + ctx.from.last_name; }
        else { valid = ctx.from.first_name; }
        if (vData.length === 0) {
          await db.collection("vUsers").insertOne({ userId: ctx.from.id, name: valid, stage: 'new' });
        }
        await afterCaptcha(ctx);
      }
    } else {
      await ctx.answerCbQuery("⛔ Callback Command Not found!");
    }
  } catch (err) {
    sendInlineError(err, ctx, db);
  }
});
//▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭
//▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭
function rndFloat(min, max) {
  return Math.random() * (max - min + 1) + min;
}
function rndInt(min, max) {
  return Math.floor(rndFloat(min, max));
}
