const { Telegraf, Composer, session, Scenes } = require("telegraf");
const env = require("../../env");
const bot = new Telegraf(env.bot_token);
const { enter, leave } = Scenes.Stage;

const { starter, starterInline } = require('../../functions/starter');
const { adminId, sendError, sendInlineError, mustJoin, isNumeric, curr } = require("../../functions/misc.js");
const { db } = require("../../functions/mongoClient");

const chkUsrDet = new Scenes.BaseScene("chkUsrDet");
const addUsrBal = new Scenes.BaseScene("addUsrBal");
const cutUsrBal = new Scenes.BaseScene("cutUsrBal");
const addUsrBal2 = new Scenes.BaseScene("addUsrBal2");
const cutUsrBal2 = new Scenes.BaseScene("cutUsrBal2");

const savePerRef = new Scenes.BaseScene("savePerRef");
const saveBonus = new Scenes.BaseScene("saveBonus");
const saveMinWith = new Scenes.BaseScene("saveMinWith");
const saveDate = new Scenes.BaseScene("saveDate");
const saveCoinName = new Scenes.BaseScene("saveCoinName");
const addPChannel = new Scenes.BaseScene("addPChannel");

chkUsrDet.enter(async (ctx) => {
  try {
    if (ctx.from.id != (await adminId())) {
      ctx.scene.leave("chkUsrDet");
      return;
    }
    await ctx
      .replyWithMarkdown("🔽 *Send User's Telegram ID to Get Details:*", {
        reply_markup: {
          keyboard: [["❌ Cancel"]],
          input_field_placeholder: "Telegram ID",
          resize_keyboard: true,
        },
      })
      .catch((err) => sendInlineError(err, ctx));
  } catch (err) {
    sendInlineError(err, ctx);
  }
});
chkUsrDet.leave(async (ctx) => await starter(ctx));
chkUsrDet.hears(["❌ Cancel", "/leave"], (ctx) => {
  ctx.scene.leave("chkUsrDet");
});
chkUsrDet.on("text", async (ctx) => {
  try {
    const msg = parseInt(ctx.message.text);

    if (ctx.from.id != (await adminId())) {
      ctx.scene.leave("chkUsrDet");
      return;
    }
    const u = await db.collection("allUsers").find({ userId: msg }).toArray();
    if (u.length===0) {
      await ctx.reply("✖ User Not Found!!");
      ctx.scene.leave("chkUsrDet");
      return;
    }
    let linkk = `<a href='tg://user?id=${msg}'>Click Here</a>`;
    const bal = await db
      .collection("balance")
      .find({ userId: msg })
      .toArray();
    let allRef = await db
      .collection("allUsers")
      .find({ inviter: msg })
      .toArray(); // all invited users

    const tg = await bot.telegram.getChat(msg);
    await ctx.reply(
      `ℹ️ <b>New User Details</b>\n\n👤<b>User :</b> <a href='tg://user?id=${
        msg
      }'>${u[0].firstName} ${u[0].lastName}</a>\n\n🆔<b>TG ID :</b> <code>${
        (u[0].userId)
      }</code>\n\n<b> Link :</b> ${linkk}\n\n<b>Balance :</b> ${
        bal[0].balance
      }\n\n🪙 <b>Made Withdraw of:</b> ${bal[0].withdraw} ${await curr()}\n\n🌀 <b>Twitter Username:</b> ${u[0].twitter}\n\n🧶 <b>Address:</b> ${
        u[0].address
      }\n\n🌝 <b>Total Refer's Count : ${allRef.length}</b>`,
      {
        parse_mode: "html",
      }
    );
    const cap = await db.collection('allUsers'). find({ inviter: ctx.from.id }).toArray();
    if(cap.length===0){
    }else{let x;
    for(var i=0; i < cap.length; i++){
      x+=`\n${Math.floor(i+1)} <a href='tg://user?id=${cap[i].userId}>${cap[i].firstName}</a>`
    }
    const msg = '📑<b> Active Referrals Report of the User</b>\n'+x
    ctx.reply(msg, {parse_mode:'html'});
    }
    const bs = db.collection('withdrawals').find({userId: ctx.from.id}).toArray();
    if(bs.length===0){
    }else{
    let x;
    for(var i=0; i < bs.length; i++){
      x+=`\n$<b>{Math.floor(i+1)} ${bs[i].amount}</b>\n🖇 ${bs[i].wallet}\n⏲️ ${bs[i].time}`
    }
    const msg = '💹 <b>Withdrawal History of User</b>\n'+x
    ctx.reply(msg, {parse_mode:'html'});
    }
    ctx.scene.leave("chkUsrDet");
    return;
  } catch (err) {
    sendError(err, ctx);
  }
});
//▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭
//▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭
//▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭
//▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭
addUsrBal.enter(async (ctx) => {
  try {
    if (ctx.from.id != (await adminId())) {
      ctx.scene.leave("addUsrBal2");
      return;
    }
    await ctx
      .replyWithMarkdown("🔽 *Send User's Telegram ID to Add Balance:*", {
        reply_markup: {
          keyboard: [["❌ Cancel"]],
          input_field_placeholder: "Telegram ID",
          resize_keyboard: true,
        },
      })
      .catch((err) => sendInlineError(err, ctx));
  } catch (err) {
    sendInlineError(err, ctx);
  }
});
addUsrBal.leave(async (ctx) => {/*await starter(ctx)*/});
addUsrBal.hears(["❌ Cancel", "/leave"], (ctx) => {
  ctx.scene.leave("addUsrBal");
});
addUsrBal.on("text", async (ctx) => {
  try {
    const msg = parseInt(ctx.message.text);
    if (ctx.from.id != (await adminId())) {
      ctx.scene.leave("addUsrBal");
    }
    const u = await db.collection("allUsers").find({ userId: msg }).toArray();
    if (u.length===0) {
      await ctx.reply("✖ User Not Found!!");
      await starter(ctx);
      ctx.scene.leave("addUsrBal");
      return;
    }

    const bal = await db
      .collection("balance")
      .find({ userId: u[0].userId })
      .toArray();

    const sal = await db
      .collection("admin")
      .find({ group: "global" })
      .toArray();
    if (sal.length === 0) {
      db.collection("admin").insertOne({
        group: "global",
        edituserid: ctx.message.text,
      });
    } else {
      db.collection("admin").updateOne(
        { group: "edit" },
        { $set: { edituserid: ctx.message.text } },
        { upsert: true }
      );
    }

    await ctx.reply(
      `👤<b>User :</b> <a href='tg://user?id=${u[0].userId}'>${
        u[0].firstName
      } ${u[0].lastName}</a>\n\n💶 <b>User Balance :</b> ${
        bal[0].balance
      } ${await curr()}`,
      {
        parse_mode: "html",
      }
    );
    ctx.scene.enter("addUsrBal2");
    return;
  } catch (err) {
    sendError(err, ctx);
  }
});

addUsrBal2.enter(async (ctx) => {
  try {
    if (ctx.from.id != (await adminId())) {
      ctx.scene.leave("addUsrBal2");
      return;
    }
    await ctx
      .replyWithMarkdown(
        "🔽 *Send the Amount of " + (await curr()) + " to Add:*",
        {
          reply_markup: {
            keyboard: [["❌ Cancel"]],
            input_field_placeholder: "Amount of " + (await curr()),
            resize_keyboard: true,
          },
        }
      )
      .catch((err) => sendError(err, ctx));
  } catch (err) {
    sendInlineError(err, ctx);
  }
});
addUsrBal2.leave(async (ctx) => await starter(ctx));
addUsrBal2.hears(["❌ Cancel", "/leave"], (ctx) => {
  ctx.scene.leave("addUsrBal2");
});
addUsrBal2.on("text", async (ctx) => {
  try {
    const mkg = ctx.message.text;
    if (ctx.from.id != (await adminId())) {
      ctx.scene.leave("addUsrBal2");
      return;
    }

    if (!isNumeric(mkg)) {
      ctx.replyWithMarkdown("*❌ Send a Valid Numeric Amount:*");
      return;
    }
    const msg = parseFloat(ctx.message.text);
    const usid = await db.collection("admin").find({ group: "edit" }).toArray();
    const uid = parseInt(usid[0].edituserid);
    let u = await db.collection("allUsers").find({ userId: uid }).toArray();
    if (u.length===0) {
      await ctx.reply("✖ User Not Found!!");
      ctx.scene.leave("addUsrBal2");
      return;
    }
    if (usid.length===0) {
      await ctx.reply("✖ User ID Not Found!!");
      ctx.scene.leave("addUsrBal2");
      return;
    }
    const bal = await db.collection("balance").find({ userId: uid }).toArray();

    let uds = bal[0].balance * 1;
    let addd = msg * 1;
    let addm = uds + addd;

    db.collection("balance").updateOne(
      { userId: uid },
      { $set: { balance: addm } },
      { upsert: true }
    );

    await ctx.reply(
      `➕ <b>${msg} ${await curr()} Added\n\n👤 User :</b> <a href='tg://user?id=${
        u[0].userId
      }'>${u[0].firstName} ${
        u[0].lastName
      }</a>\n\n💸 <b>Updated Balance :</b> ${addm} ${await curr()}`,
      {
        parse_mode: "html",
      }
    );
    ctx.scene.leave("addUsrBal2");
    return;
  } catch (err) {
    sendError(err, ctx);
  }
});
//▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭
//▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭
//▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭
//▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭
cutUsrBal.enter(async (ctx) => {
  try {
    if (ctx.from.id != (await adminId())) {
      ctx.scene.leave("cutUsrBal");
      return;
    }
    await ctx
      .replyWithMarkdown("🔽 *Send User's Telegram ID to Cut Balance:*", {
        reply_markup: {
          keyboard: [["❌ Cancel"]],
          input_field_placeholder: "Telegram ID",
          resize_keyboard: true,
        },
      })
      .catch((err) => sendInlineError(err, ctx));
  } catch (err) {
    sendInlineError(err, ctx);
  }
});
cutUsrBal.leave(async (ctx) => {/*await starter(ctx)*/});
cutUsrBal.hears(["❌ Cancel", "/leave"], (ctx) => {
  ctx.scene.leave("cutUsrBal");
});
cutUsrBal.on("text", async (ctx) => {
  try {
    const msg = parseInt(ctx.message.text);
    if (ctx.from.id != (await adminId())) {
      ctx.scene.leave("cutUsrBal");
    }
    const u = await db.collection("allUsers").find({ userId: msg }).toArray();
    if (u.length === 0) {
      await ctx.reply("✖ User Not Found!!");
      ctx.scene.leave("cutUsrBal");
      await starter(ctx);
      return;
    }

    const bal = await db
      .collection("balance")
      .find({ userId: u[0].userId })
      .toArray();

    const sal = await db
      .collection("admin")
      .find({ group: "global" })
      .toArray();
    if (sal.length === 0) {
      db.collection("admin").insertOne({
        group: "global",
        edituserid: ctx.message.text,
      });
    } else {
      db.collection("admin").updateOne(
        { group: "edit" },
        { $set: { edituserid: ctx.message.text } },
        { upsert: true }
      );
    }

    await ctx.reply(
      `👤<b>User :</b> <a href='tg://user?id=${u[0].userId}'>${
        u[0].firstName
      } ${u[0].lastName}</a>\n\n💶 <b>User Balance :</b> ${
        bal[0].balance
      } ${await curr()}`,
      {
        parse_mode: "html",
      }
    );
    ctx.scene.enter("cutUsrBal2");
    return;
  } catch (err) {
    sendError(err, ctx);
  }
});

cutUsrBal2.enter(async (ctx) => {
  try {
    if (ctx.from.id != (await adminId())) {
      ctx.scene.leave("cutUsrBal2");
      return;
    }
    await ctx
      .replyWithMarkdown(
        "🔽 *Send the Amount of " + (await curr()) + " to Cut:*",
        {
          reply_markup: {
            keyboard: [["❌ Cancel"]],
            input_field_placeholder: "Amount of " + (await curr()),
            resize_keyboard: true,
          },
        }
      )
      .catch((err) => sendError(err, ctx));
  } catch (err) {
    sendInlineError(err, ctx);
  }
});
cutUsrBal2.leave(async (ctx) => await starter(ctx));
cutUsrBal2.hears(["❌ Cancel", "/leave"], (ctx) => {
  ctx.scene.leave("cutUsrBal2");
});
cutUsrBal2.on("text", async (ctx) => {
  try {
    const mkg = ctx.message.text;
    if (ctx.from.id != (await adminId())) {
      ctx.scene.leave("cutUsrBal2");
      return;
    }

    if (!isNumeric(mkg)) {
      ctx.replyWithMarkdown("*❌ Send a Valid Numeric Amount:*");
      return;
    }
    const msg = parseFloat(ctx.message.text);

    const usid = await db
      .collection("admin")
      .find({ group: "edit" })
      .toArray();
    const uid = parseInt(usid[0].edituserid);

    let u = await db.collection("allUsers").find({ userId: uid }).toArray();
    if (u.length === 0) {
      await ctx.reply("✖ User Not Found!!");
      ctx.scene.leave("cutUsrBal2");
      return;
    }
    if (usid.length===0) {
      await ctx.reply("✖ User ID Not Found!!");
      ctx.scene.leave("cutUsrBal2");
      return;
    }
    const bal = await db.collection("balance").find({ userId: uid }).toArray();

    let uds = bal[0].balance * 1;
    let addd = msg * 1;
    let cutm = uds - addd;

    db.collection("balance").updateOne(
      { userId: uid },
      { $set: { balance: cutm } },
      { upsert: true }
    );

    await ctx.reply(
      `➖ <b>${msg} ${await curr()} Deducted\n\n👤 User :</b> <a href='tg://user?id=${
        u[0].userId
      }'>${u[0].firstName} ${
        u[0].lastName
      }</a>\n\n💸 <b>Updated Balance :</b> ${cutm} ${await curr()}`,
      {
        parse_mode: "html",
      }
    );
    ctx.scene.leave("cutUsrBal2");
    return;
  } catch (err) {
    sendError(err, ctx);
  }
});

//▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭
//▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭
//▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭
//▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭
//▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭

saveDate.enter(async (ctx) => {
  try {
    if (ctx.from.id != (await adminId())) {
      ctx.scene.leave("saveDate");
      return;
    }
    await ctx
      .replyWithMarkdown(
        "🔽 *Send Message with Full Date:*\n_Send /null to Remove the Info_",
        {
          reply_markup: {
            keyboard: [["❌ Cancel"]],
            input_field_placeholder: "Telegram ID",
            resize_keyboard: true,
          },
        }
      )
      .catch((err) => sendInlineError(err, ctx));
  } catch (err) {
    sendInlineError(err, ctx);
  }
});
saveDate.leave(async (ctx) => await starter(ctx));
saveDate.hears(["/leave", "/start", "❌ Cancel"], (ctx) => {
  ctx.scene.leave("saveDate");
});
saveDate.on("text", async (ctx) => {
  try {
    if (ctx.from.id != (await adminId())) {
      ctx.scene.leave("saveDate");
      return;
    }
    if (ctx.message.text == "/null") {
      let update = await db
        .collection("admin")
        .find({ group: "global" })
        .toArray();
      if (update.length === 0) {
        db.collection("admin").insertOne({
          group: "global",
          coininfo: "📵 <b>Currently No Information Found!</b>",
        });
      } else {
        db.collection("admin").updateOne(
          { group: "global" },
          { $set: { coininfo: "📵 <b>Currently No Information Found!</b>" } },
          { upsert: true }
        );
      }
      await ctx.replyWithMarkdown("✅ *Date Info has been Resetted!*");
      ctx.scene.leave("saveDate");
      return;
    }
    //await db.collection('admin').find({group: 'global'}).toArray()
    let update = await db
      .collection("admin")
      .find({ group: "global" })
      .toArray();
    if (update.length === 0) {
      db.collection("admin").insertOne({
        group: "global",
        coininfo: ctx.message.text,
      });
    } else {
      db.collection("admin").updateOne(
        { group: "global" },
        { $set: { coininfo: ctx.message.text } },
        { upsert: true }
      );
    }
    await ctx.replyWithMarkdown("✅ *Date Info Saved to the Database!!*");
    ctx.scene.leave("saveDate");
  } catch (err) {
    sendError(err, ctx);
  }
});

//▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭
//▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭

saveCoinName.enter(async (ctx) => {
  try {
    if (ctx.from.id != (await adminId())) {
      ctx.scene.leave("saveCoinName");
      return;
    }
    await ctx
      .replyWithMarkdown(
        "🔽 *Send the Airdrop Coin Name to Use in Full Bot:*",
        {
          reply_markup: {
            keyboard: [["❌ Cancel"]],
            input_field_placeholder: "Coin Name",
            resize_keyboard: true,
          },
        }
      )
      .catch((err) => sendInlineError(err, ctx));
  } catch (err) {
    sendInlineError(err, ctx);
  }
});
saveCoinName.leave(async (ctx) => await starter(ctx));
saveCoinName.hears(["/leave", "/start", "❌ Cancel"], (ctx) => {
  ctx.scene.leave("saveCoinName");
});
saveCoinName.on("text", async (ctx) => {
  try {
    let msg = ctx.message.text;
    if (ctx.from.id != (await adminId())) {
      ctx.scene.leave("saveCoinName");
      return;
    }
    if (msg.length <= 5) {
    } else {
      ctx.replyWithMarkdown(
        "❌ *Coin Name too Big*, Send Only *4-5 Digit Name:*"
      );
      return;
    }

    let update = await db
      .collection("admin")
      .find({ group: "global" })
      .toArray();
    if (update.length === 0) {
      db.collection("admin").insertOne({
        group: "global",
        currency: ctx.message.text,
      });
    } else {
      db.collection("admin").updateOne(
        { group: "global" },
        { $set: { currency: ctx.message.text } },
        { upsert: true }
      );
    }
    await ctx.replyWithMarkdown("✅ *Coin Name Changed to:*" + msg);
    ctx.scene.leave("saveCoinName");
  } catch (err) {
    sendError(err, ctx);
  }
});

//▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭
//▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭

savePerRef.enter(async (ctx) => {
  try {
    if (ctx.from.id != (await adminId())) {
      ctx.scene.leave("savePerRef");
      return;
    }
    await ctx
      .replyWithMarkdown(
        "👬 *Send the Amount of " + (await curr()) + " to Per Refer:*",
        {
          reply_markup: {
            keyboard: [["❌ Cancel"]],
            input_field_placeholder: "Per Refer Amount",
            resize_keyboard: true,
          },
        }
      )
      .catch((err) => sendInlineError(err, ctx));
  } catch (err) {
    sendInlineError(err, ctx);
  }
});
savePerRef.leave(async (ctx) => await starter(ctx));
savePerRef.hears(["❌ Cancel", "/leave"], (ctx) => {
  ctx.scene.leave("savePerRef");
});
savePerRef.on("text", async (ctx) => {
  try {
    const msg = ctx.message.text;
    if (ctx.from.id != (await adminId())) {
      ctx.scene.leave("savePerRef");
    }
    if (!isNumeric(msg)) {
      ctx.replyWithMarkdown("*❌ Send a Valid Numeric Per Refer Amount:*");
      return;
    }

    const sal = await db.collection("admin").find({ group: "global" }).toArray();

    const preva =
      sal.length === 0 || !sal[0].perrefer
        ? "Not Set"
        : sal[0].perrefer + " " + (await curr());

    if (sal.length === 0) {
      db.collection("admin").insertOne({
        group: "global",
        perrefer: ctx.message.text,
      });
    } else {
      db.collection("admin").updateOne(
        { group: "global" },
        { $set: { perrefer: ctx.message.text } },
        { upsert: true }
      );
    }
    await ctx.reply(
      `👤 <b>Per Refer Amount Changed:</b>
      
      <b>~ From:</b> ${preva}
      <b>~ To:</b> ${msg} ${await curr()}`,
      {
        parse_mode: "html",
      }
      );

      if(preva=='Not Set'){
        let yex = 0;
        const xData = await db.collection('pendingRef').find({}).toArray()
        if(xData.length===0){
        }else{
          for(var i in xData){
            const bal = await db.collection('balance').find({userId: xData[i].userId}).toArray()
            if(xData[i].state==='unpaid'){
              var cal = bal[0].balance * 1;
              var sen = msg * 1;
              var see = cal + sen;
              db.collection("balance").updateOne({ userId: xData[i].userId },{ $set: { balance: see } },{ upsert: true });
              db.collection('pendingRef').updateOne({userId: xData[i].inviter},{$set:{state:'paid'}},{upsert:true});
              bot.telegram.sendMessage(xData[i].userId,`💖 <b>Referral Amount for Inviting :</b> ${xData[0].ref}\n\n➕ <b>Amount :</b> ${msg} ${await curr()} <i>is Added to Your Account!</i>`,{parse_mode: 'html'})
              yex= Math.floor(yex + 1);
            }
          }
          if(yex>0){
            ctx.replyWithMarkdown(`🙋‍♂️ *Total* _${yex}_ Unpaid Refer Amounts were Served!`)
          }
        }
      }
      ctx.scene.leave("savePerRef");
    return;
  } catch (err) {
    sendError(err, ctx);
  }
});

//▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭
//▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭

saveBonus.enter(async (ctx) => {
  try {
    if (ctx.from.id != (await adminId())) {
      ctx.scene.leave("saveBonus");
      return;
    }
    await ctx
      .replyWithMarkdown(
        "👬 *Send the Amount of " +
          (await curr()) +
          " to Add as Daily Bonus:*\n\nSend `0` to Remove Bonus",
        {
          reply_markup: {
            keyboard: [["❌ Cancel"]],
            input_field_placeholder: "Daily Bonus Amount",
            resize_keyboard: true,
          },
        }
      )
      .catch((err) => sendInlineError(err, ctx));
  } catch (err) {
    sendInlineError(err, ctx);
  }
});
saveBonus.leave(async (ctx) => await starter(ctx));
saveBonus.hears(["❌ Cancel", "/leave"], (ctx) => {
  ctx.scene.leave("saveBonus");
});
saveBonus.on("text", async (ctx) => {
  try {
    const msg = ctx.message.text;
    if (ctx.from.id != (await adminId())) {
      ctx.scene.leave("saveBonus");
    }
    if (!isNumeric(msg)) {
      ctx.replyWithMarkdown("*❌ Send a Valid Numeric Daily Bonus Amount:*");
      return;
    }

    const sal = await db
      .collection("admin")
      .find({ group: "global" })
      .toArray();
    const preva =
      sal.length === 0 || !sal[0].dailybonus
        ? "Not Set"
        : sal[0].dailybonus + " " + (await curr());

    if (sal.length === 0) {
      db.collection("admin").insertOne({
        group: "global",
        dailybonus: ctx.message.text,
      });
    } else {
      db.collection("admin").updateOne(
        { group: "global" },
        { $set: { dailybonus: ctx.message.text } },
        { upsert: true }
      );
    }

    await ctx.reply(
      `🎁 <b>Daily Bonus Amount Changed:</b>
      
      <b>~ From:</b> ${preva}
      <b>~ To:</b> ${msg} ${await curr()}`,
      {
        parse_mode: "html",
      }
    );
    ctx.scene.leave("saveBonus");
    return;
  } catch (err) {
    sendError(err, ctx);
  }
});

//▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭
//▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭
//▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭

saveMinWith.enter(async (ctx) => {
  try {
    if (ctx.from.id != (await adminId())) {
      ctx.scene.leave("saveMinWith");
      return;
    }
    await ctx
      .replyWithMarkdown(
        "👬 *Send the Minimum Amount of " +
          (await curr()) +
          " Needed for Withdraw:*",
        {
          reply_markup: {
            keyboard: [["❌ Cancel"]],
            input_field_placeholder: "Minimum Withdraw Amount",
            resize_keyboard: true,
          },
        }
      )
      .catch((err) => sendInlineError(err, ctx));
  } catch (err) {
    sendInlineError(err, ctx);
  }
});
saveMinWith.leave(async (ctx) => await starter(ctx));
saveMinWith.hears(["❌ Cancel", "/leave"], (ctx) => {
  ctx.scene.leave("saveMinWith");
});
saveMinWith.on("text", async (ctx) => {
  try {
    const msg = ctx.message.text;
    if (ctx.from.id != (await adminId())) {
      ctx.scene.leave("saveMinWith");
    }
    if (!isNumeric(msg)) {
      ctx.replyWithMarkdown(
        "*❌ Send a Valid Numeric Minimum Withdrawal Amount:*"
      );
      return;
    }

    const sal = await db
      .collection("admin")
      .find({ group: "global" })
      .toArray();
    const preva =
      sal.length === 0 || !sal[0].minwithdraw
        ? "Not Set"
        : sal[0].minwithdraw + " " + (await curr());

    if (sal.length === 0) {
      db.collection("admin").insertOne({
        group: "global",
        perrefer: ctx.message.text,
      });
    } else {
      db.collection("admin").updateOne(
        { group: "global" },
        { $set: { minwithdraw: ctx.message.text } },
        { upsert: true }
      );
    }

    await ctx.reply(
      `📤 <b>Minimum Withdrawal Amount Changed:</b>
      
      <b>~ From:</b> ${preva}
      <b>~ To:</b> ${msg} ${await curr()}`,
      {
        parse_mode: "html",
      }
    );
    ctx.scene.leave("saveMinWith");
    return;
  } catch (err) {
    sendError(err, ctx);
  }
});
//▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭
//▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭
//▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭
//▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭
//▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭
//▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭

addPChannel.enter(async (ctx) => {
  if (ctx.from.id != (await adminId())) {
    ctx.scene.leave("addPChannel");
    return;
  }
  await ctx.replyWithMarkdown("*🌀 Send Payment Channel Username with '@'*", {
    reply_markup: { keyboard: [["⬅️ Return"]], resize_keyboard: true },
  });
});
addPChannel.leave(async (ctx) => await starter(ctx));
addPChannel.hears(["🔙 Back", "/start", "⬅️ Return"], async (ctx) => {
  await ctx.replyWithMarkdown(`*🎛️ Payment Channel Modifying Process Terminated!*`);
  ctx.scene.leave("addPChannel");
});
addPChannel.on("text", async (ctx) => {
  try {
    const msg = ctx.message.text;

    if (ctx.from.id != (await adminId())) {
      ctx.scene.leave("addPChannel");
      return;
    }

    const len = msg.length + 1;
    const ch = msg.slice(1, len);
    if (msg.slice(0, 1) != "@" || msg.length <= 5) {
      await ctx.replyWithMarkdown(
        "⛔ *Incorrect Username!* _Please send a Correct one with '@' or click /start to leave the Operation_"
      );
    } else {
      let jb = 'false';
      let tgData = await bot.telegram.getChatMember('@'+ch, ctx.botInfo.id)
        .catch(async (err) => {
          if(err.message == '400: Bad Request: chat not found' || err.data == '400: Bad Request: chat not found'){
            jb = 'null'
          }else if(err.message == '403: Forbidden: bot was kicked from the channel chat'){
            jb = 'true'
          }else{ sendInlineError(err, ctx, db) }
        })
        if(jb == 'null'){
          await ctx.replyWithMarkdown('_Channel with ['+ch+']\n🙋 *Please Send any Valid Channel Link!!*')
          return 
        }
        if(jb == 'true'){
        await ctx.replyWithMarkdown('_⛔ Bot is Removed from Channel:_ [@'+ch+']\n🙋 *Please Add the Bot Again and promote to Admin in The Channel and then Try adding Channel!!*')
        ctx.scene.leave("addPChannel");
        return 
      }
      if(!tgData){
        await ctx.replyWithMarkdown('_⛔ Bot is not Admin in Channel:_ [@'+ch+']\n🙋 *Promote the Bot in The Channel and then Try Adding Channel!!*')
        ctx.scene.leave("addPChannel");
        return
      }else if(tgData.status != 'administrator'){
        await ctx.replyWithMarkdown('_⛔ Bot is not Admin in Channel:_ [@'+ch+']\n🙋 *Promote the Bot in The Channel and then Try Adding Channel!!*')
        ctx.scene.leave("addPChannel");
        return
      }

      const chh = await db.collection("admin").find({group: 'global'}).toArray();
      let chnl = (chh.length===0 || !(chh[0].paymentchannel)) ? 'Not Set' : chh[0].paymentchannel

      db.collection("admin").updateOne({group: 'global'},{$set: { paymentchannel: ch}},{upsert: true});
      await ctx.reply(
        `🅿 <b>Payment Channel Modified:</b> \n\n<i>from:</i> ${chnl}\n<i>to:</i> @${ch}\n\n✅ <i>All Payment Remainder will be Updated on this Channel!</i>`,
        { parse_mode: "html" }
      );
      ctx.scene.leave("addPChannel");
    }
  } catch (err) {
    sendError(err, ctx);
  }
});

exports.chkUsrDet = chkUsrDet;
exports.saveDate = saveDate;
exports.addUsrBal = addUsrBal;
exports.addUsrBal2 = addUsrBal2;
exports.cutUsrBal = cutUsrBal;
exports.cutUsrBal2 = cutUsrBal2;
exports.saveBonus = saveBonus;
exports.savePerRef = savePerRef;
exports.saveMinWith = saveMinWith;
exports.saveCoinName = saveCoinName;
exports.addPChannel = addPChannel;