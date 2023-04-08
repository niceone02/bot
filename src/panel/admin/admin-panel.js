const { Telegraf, Composer, session, Extra, Markup, Scenes } = require("telegraf");
const env = require("../../env");
//const bot = new Telegraf(env.bot_token)
const {adminId,  findUser, findUserCallback, sendError, sendInlineError, mustJoin,} = require("../../functions/misc.js");
const { db } = require("../../functions/mongoClient");

const aPan = new Composer();

aPan.action("/check_details", async (ctx) => {
  try {
    await ctx.answerCbQuery();

    if (ctx.from.id != (await adminId())) {
      return;
    }

    ctx.scene.enter("chkUsrDet");
  } catch (err) {
    sendInlineError(err, ctx, db);
  }
});
aPan.action("/add_balance", async (ctx) => {
  try {
    await ctx.answerCbQuery();

    if (ctx.from.id != (await adminId())) {
      return;
    }

    ctx.scene.enter("addUsrBal");
  } catch (err) {
    sendInlineError(err, ctx, db);
  }
});
aPan.action("/cut_balance", async (ctx) => {
  try {
    await ctx.answerCbQuery();

    if (ctx.from.id != (await adminId())) {
      return;
    }

    ctx.scene.enter("cutUsrBal");
  } catch (err) {
    sendInlineError(err, ctx, db);
  }
});

aPan.action("/set_date", async (ctx) => {
  try {
    await ctx.answerCbQuery();

    if (ctx.from.id != (await adminId())) {
      return;
    }

    ctx.scene.enter("saveDate");
  } catch (err) {
    sendInlineError(err, ctx, db);
  }
});

aPan.action("/set_coinname", async (ctx) => {
  try {
    await ctx.answerCbQuery();

    if (ctx.from.id != (await adminId())) {
      return;
    }

    ctx.scene.enter("saveCoinName");
  } catch (err) {
    sendInlineError(err, ctx, db);
  }
});

aPan.action("/set_perrefer", async (ctx) => {
  try {
    await ctx.answerCbQuery();

    if (ctx.from.id != (await adminId())) {
      return;
    }

    ctx.scene.enter("savePerRef");
  } catch (err) {
    sendInlineError(err, ctx, db);
  }
});

aPan.action("/set_dailybonus", async (ctx) => {
  try {
    await ctx.answerCbQuery();

    if (ctx.from.id != (await adminId())) {
      return;
    }

    ctx.scene.enter("saveBonus");
  } catch (err) {
    sendInlineError(err, ctx, db);
  }
});

aPan.action("/set_minwith", async (ctx) => {
  try {
    await ctx.answerCbQuery();

    if (ctx.from.id != (await adminId())) {
      return;
    }

    ctx.scene.enter("saveMinWith");
  } catch (err) {
    sendInlineError(err, ctx, db);
  }
});

module.exports = { aPan };
