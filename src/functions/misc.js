const env = require("../env");
//const channels = data.channelsList
const admin = env.admin;
const { Telegraf, session, Extra, Markup, Scenes } = require("telegraf");
const bot = new Telegraf(env.bot_token);

const { db } = require("./mongoClient");

async function adminId() {
  const admin = await db.collection("admin").findOne({ group: "admin" });
  return admin?.adminId || env.admin;
}
async function curr() {
  const admin = await db.collection("admin").find({ group: "global" }).toArray();
  //const jet = (admin.length===0 || !(admin[0].currency)) ? 'TRON' : 
  if(admin[0]){
  return admin[0].currency ;
}else{
    return "TRON";}}

async function mustJoin(ctx) {
  const chh = await db.collection("channels").find({}).toArray();
  const pre = await db.collection("admin").find({ group: "global" }).toArray();
  const pref = pre.length === 0 || !pre[0].perrefer ? "20" : pre[0].perrefer;
let msg = `<b>💡 You Must Join Our Channel</b>
`
  for (var ind in chh) {
    var cha = chh[ind].channel;
    msg += "\n➡ @" + cha + "";
  }
  
  await ctx.reply(msg, {
    parse_mode: "html",
    reply_markup: {
      inline_keyboard: [[{ text: "✅ Joined", callback_data: "/joined" }]],
    },
  });
}

async function sendError(err, ctx) {
  if (ctx.message.text) {
    if (err.message != undefined) {
      await ctx.reply("An Error Happened ☹️: " + err.message);
    } else if (err.data != undefined) {
      await ctx.reply("An Error Happened ☹️: " + err.data);
    }

    let admin = await adminId();

    await bot.telegram.sendMessage(
      admin,
      `<b>Error From</b> <a href='tg://user?id=${ctx.from.id}'>${ctx.from.first_name}</a>\n\n<b>Error:</b> ${err}\n<b>User's Message:</b> ${ctx.message.text}`,
      { parse_mode: "html" }
    );
  } else {
    sendInlineError(err, ctx, db);
  }
}
async function sendInlineError(err, ctx) {
  if (ctx.update.callback_query.data) {
    if (
      err.message ==
      "400: Bad Request: message is not modified: specified new message content and reply markup are exactly the same as a current content and reply markup of the message"
    ) {
      return;
    }
    let admin;
    admin = await adminId();

    await ctx.reply("An Error Happened ☹️: " + err.message);

    await bot.telegram.sendMessage(
      admin,
      `<b>Inline Error From</b> <a href='tg://user?id=${ctx.update.callback_query.from.id}'>${ctx.update.callback_query.from.first_name}</a> \n\n<b>Error:</b> ${err}\n<b>User Clicked:</b> ${ctx.update.callback_query.data}`,
      { parse_mode: "html" }
    );
  } else {
    sendError(err, ctx, db);
  }
}

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

async function findUserCallback(ctx) {
  let isInChannel = true;
  const chh = await db.collection("channels").find({ joincheck: "tru" }).toArray();
    
  const uu = await db.collection("allUsers").find({ userId:ctx.from.id }).toArray();
  if(uu[0].stage=='new'){
    await db.collection("allUsers").updateOne({ userId: ctx.from.id},{$set: {stage:'old'}},{upsert: true});
    return false;
  }

  if (chh.length === 0) {
    return isInChannel;
  }
  for (let i = 0; i < chh.length; i++) {
    const chat = chh[i].channel; //cha[i];
    let tgData = await bot.telegram.getChatMember(
      "@" + chat + "",
      ctx.update.callback_query.from.id
    );

    const sub = ["creator", "administrator", "member"].includes(tgData.status);
    if (!sub) {
      isInChannel = false;
      break;
    }
  }
  return isInChannel;
}
async function findUser(ctx) {
  let isInChannel = true;
  const chh = await db.collection("channels").find({ joincheck: "tru" }).toArray();
  const uu = await db.collection("allUsers").find({ userId:ctx.from.id }).toArray();
  if(uu[0].stage=='new'){
    await db.collection("allUsers").updateOne({ userId: ctx.from.id},{$set: {stage:'old'}},{upsert: true});
    return false;
  }
  if (chh.length === 0) {
    return isInChannel;
  }
  for (let i = 0; i < chh.length; i++) {
    const chat = chh[i].channel;
    let tgData = await bot.telegram.getChatMember("@" + chat + "", ctx.from.id);

    const sub = ["creator", "administrator", "member"].includes(tgData.status);
    if (!sub) {
      isInChannel = false;
      break;
    }
  }
  return isInChannel;
}

async function globalBroadCast(ctx, userId) {
  let perRound = 10000;
  let totalBroadCast = 0;
  let totalFail = 0;

  let postMessage = ctx.message.text;

  let totalUsers = await db.collection("allUsers").find({}).toArray();

  let noOfTotalUsers = totalUsers.length;
  let lastUser = noOfTotalUsers - 1;

  for (let i = 0; i <= lastUser; i++) {
    setTimeout(function () {
      sendMessageToUser( userId, totalUsers[i].userId, postMessage, i === lastUser, totalFail, totalUsers.length );
    }, i * perRound);
  }
  return ctx.reply(
    "Your message is queued and will be posted to all of your subscribers soon. Your total subscribers: " +
      noOfTotalUsers
  );
}

function sendMessageToUser( publisherId, subscriberId, message, last, totalFail, totalUser ) {
  bot.telegram
    .sendMessage(subscriberId, message, { parse_mode: "html" })
    .catch((e) => {
      if (e == "Forbidden: bot was block by the user") {
        totalFail++;
      }
    });
  let totalSent = totalUser - totalFail;

  if (last) {
    bot.telegram.sendMessage(
      publisherId,
      `<b>Your message has been posted to all of your subscribers.</b>\n\n<b>Total User:</b> ${totalUser}\n<b>Total Sent:</b> ${totalSent}\n<b>Total Failed:</b> ${totalFail}`,
      { parse_mode: "html" }
    );
  }
}

module.exports = { adminId, findUser, findUserCallback, sendError, sendInlineError, mustJoin, isNumeric, globalBroadCast, curr };
