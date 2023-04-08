const env = require('../env')
const { Telegraf } = require("telegraf");
const bot = new Telegraf(env.bot_token);
const { adminId, findUser, findUserCallback, sendError, sendInlineError, mustJoin, curr } = require("./misc.js");

const { db } = require("./mongoClient");
async function menuText(ctx) {
  return `👋 Hey ${
    ctx.from.first_name
  }!\n🎉 Welcome In Our ${await curr()} Airdrop`;
}

async function startedBot(ctx) {
  try {
    let pData = await db.collection("pendUsers").find({ userId: ctx.from.id }).toArray();
    let dData = await db.collection("allUsers").find({ userId: ctx.from.id }).toArray();

    if ("inviter" in pData[0] && !("referred" in dData[0])) {
      let bal = await db.collection("balance").find({ userId: pData[0].inviter }).toArray();
      const pre = await db.collection("admin").find({ group: "global" }).toArray();

      const ref_bonus = pre.length === 0 || !pre[0].perrefer ? "Not Set" : pre[0].perrefer;

      db.collection("allUsers").updateOne({ userId: ctx.from.id },{ $set: { inviter: pData[0].inviter, referred: "done" } },{ upsert: true });
      
      let totRefs = await db.collection("allUsers").find({ inviter: ctx.from.id }).toArray();
      
      let msg;
      const xData = await db.collection('pendingRef').find({userId: pData[0].inviter, ref:ctx.from.id}).toArray()
      if(ref_bonus=='Not Set'&&xData.length===0){
        db.collection('pendingRef').insertOne({userId: pData[0].inviter, ref: ctx.from.id, state:'unpaid'})
        msg = `💁‍♂️ Referral Amount is not configured by Admin, You will Receive your Ref Amount once the Admin set the Amount`
      }else{
        var cal = bal[0].balance * 1;
        var sen = ref_bonus * 1;
        var see = cal + sen;
        msg = `➕ <b>Amount :</b> ${ref_bonus} ${await curr()} <b>Added to Balance</b>` 
        db.collection("balance").updateOne({ userId: pData[0].inviter },{ $set: { balance: see } },{ upsert: true });
      }
      await bot.telegram.sendMessage(
        pData[0].inviter,
        `➕ <b>New User Attracted by Your Referral link</b>\n\n🙋 <b>User :</b> <a href='tg://user?id=${ctx.from.id}'>${ctx.from.first_name}</a>\n\n${msg}\n\n📟 <b>Total Invited :</b> <i>${totRefs.length} User(s)</i>`,
        { parse_mode: "html" }
      );
      
      ctx.reply(`🙋‍♂️ <b>You were Invited to This Bot by:</b> <a href='tg://user?id=${pData[0].inviter}'>${pData[0].inviter}</a>`,
    {parse_mode:"html"})
      db.collection('vUsers').updateOne({ userId: ctx.from.id}, {$set:{stage:'old'}},{upsert: true})
    }
    
    const bal = await db.collection("balance").find({ userId: ctx.from.id }).toArray();
    const app = await db.collection("admin").findOne({ group: "global" });
    if (app.length === 0 || !app?.dailybonus || app?.dailybonus === "0") {
      await ctx.reply(`<b>${await menuText(ctx)}</b>`, {
        parse_mode: "html",
        reply_markup: {
          keyboard: [ ["🚼 Referral"], ["📛 Withdrawal", "🆔 Balance", "⭐️ History"], ["✅ CLAIM FREE"] ],
          resize_keyboard: true,
        },
      });
    } else {
      
      await ctx.reply(`<b>${await menuText(ctx)}</b>`, {
        parse_mode: "html",
        reply_markup: {
keyboard: [
            ["🚼 Referral"],
            ["📛 Withdrawal", "🆔 Balance", "⭐️ History"],
            ["✅ CLAIM FREE"]
          ],
          resize_keyboard: true,
        },
      });
    }
  } catch (err) {
    sendError(err, ctx);
  }
}
async function startedInlineBot(ctx) {
  try {
    let cyx = ctx.update.callback_query;
    if (!cyx) {
      await startedBot(ctx);
      return;
    }
    let pData = await db.collection("pendUsers").find({ userId: cyx.from.id }).toArray();
    let dData = await db.collection("allUsers").find({ userId: cyx.from.id }).toArray();
    if ("inviter" in pData[0] && !("referred" in dData[0])) {
      let bal = await db.collection("balance").find({ userId: pData[0].inviter }).toArray();
      const pre = await db.collection("admin").find({ group: "global" }).toArray();

      const ref_bonus = pre.length === 0 || !pre[0].perrefer ? "20" : pre[0].perrefer;
      var cal = bal[0].balance * 1;
      var sen = ref_bonus * 1;
      var see = cal + sen;
      db.collection("allUsers").updateOne({ userId: cyx.from.id },{ $set: { inviter: pData[0].inviter, referred: "done" } },{ upsert: true });
      let totRefs = await db.collection("allUsers").find({ inviter: cyx.from.id }).toArray();

      let msg;
      const xData = await db.collection('pendingRef').find({userId: pData[0].inviter, ref:ctx.from.id}).toArray()
      if(ref_bonus=='Not Set'&&xData.length===0){
        db.collection('pendingRef').insertOne({userId: pData[0].inviter, ref: ctx.from.id, state:'unpaid'})
        msg = `💁‍♂️ Referral Amount is not configured by Admin, You will Receive your Ref Amount once the Admin set the Amount`
      }else{
        var cal = bal[0].balance * 1;
        var sen = ref_bonus * 1;
        var see = cal + sen;
        msg = `➕ <b>Amount :</b> ${ref_bonus} ${await curr()} <b>Added to Balance</b>` 
        db.collection("balance").updateOne({ userId: pData[0].inviter },{ $set: { balance: see } },{ upsert: true });
      }
      await bot.telegram.sendMessage(
        pData[0].inviter,
        `➕ <b>There was a New User Attracted by Your Referral link</b>\n\n${msg}\n\n🙋 <b>User :</b> <a href='tg://user?id=${cyx.from.id}'>${cyx.from.first_name}</a>\n\n📟 <b>Total Invited :</b> <i>${totRefs.length} User(s)</i>`,
        { parse_mode: "html" }
      );
      db.collection("balance").updateOne({ userId: pData[0].inviter },{ $set: { balance: see } },{ upsert: true });
      ctx.reply(`🙋‍♂️ <b>You were Invited to This Bot by:</b> <a href='tg://user?id=${pData[0].inviter}'>${pData[0].inviter}</a>`,
                {parse_mode:"html"})
      db.collection('vUsers').updateOne({ userId: ctx.from.id}, {$set:{stage:'old'}},{upsert: true})
    }

    const bal = await db.collection("balance").find({ userId: cyx.from.id }).toArray();

    const app = await db.collection("admin").findOne({ group: "global" });
    if (app.length === 0 || !app?.dailybonus || app?.dailybonus === "0") {
      await ctx.reply(`<b>${await menuText(ctx)}</b>`, {
        parse_mode: "html",
        reply_markup: {
          keyboard: [
            ["💸 Balance ~ " + bal[0].balance + " " + await curr() + ""],
            ["👬 Refer", "📤 Withdraw"],
            ["ℹ About " + await curr(),"🪙 History", "🔝 Top 20 Referrals"],
          ],
          resize_keyboard: true,
        },
      });
    } else {
      let totRefs = await db.collection("allUsers").find({ inviter: ctx.from.id }).toArray();
      console.log(totRefs.length)
      await ctx.reply(`<b>${await menuText(ctx)}</b>`, {
        parse_mode: "html",
        reply_markup: {
          keyboard: [
            ["💸 Balance ~ " + bal[0].balance + " " + await curr() + ""],
            ["👬 Refer", "🎁 Bonus", "📤 Withdraw"],
            ["ℹ About " + await curr(),"🪙 History", "🔝 Top 20 Referrals"],
          ],
          resize_keyboard: true,
        },
      });
    }
  } catch (err) {
    sendInlineError(err, ctx);
  }
}

exports.starter = startedBot;
exports.starterInline = startedInlineBot;
