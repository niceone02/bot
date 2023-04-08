const { send } = require("process");
const { Telegraf, Composer, session, Scenes } = require("telegraf");
const env = require("../env");
const bot = new Telegraf(env.bot_token);
//const { BaseScene, Stage } = Scenes
const { enter, leave } = Scenes.Stage;
//const stage = new Stage();
//const Scene = BaseScene
const { starter, starterInline } = require('../functions/starter');
const {adminId, findUser, findUserCallback, sendError, sendInlineError, mustJoin, isNumeric, globalBroadCast, curr} = require("../functions/misc.js");
const { db } = require("../functions/mongoClient");

const { addPChannel, chkUsrDet, saveDate, addUsrBal, cutUsrBal, addUsrBal2, cutUsrBal2, saveCoinName, saveBonus, saveMinWith, savePerRef } = require("../panel/admin/adminScene");

const reply = new Scenes.BaseScene("reply");
const getTweet = new Scenes.BaseScene("getTweet");
const getWallet = new Scenes.BaseScene("getWallet");
const getMsg = new Scenes.BaseScene("getMsg");
const addNewChannel = new Scenes.BaseScene("addNewChannel");
const { onWithdraw } = require('../commands/withdraw')

/*const onWithdraw = new Scene('onWithdraw')
stage.register(onWithdraw)*/

reply.enter(async (ctx) => {
  reply.on("text", async (ctx)=>{
try{
  const key =  [
    [{ text: "🎤 Reply To Admin", callback_data: "/support" }]]
    console.log(ctx.message.text)
  bot.telegram.sendMessage(await adminId(), "<b>Message From Admin :</b>\n"+await ctx.message.text,{parse_mode:"html",reply_markup:{inline_keyboard:key},disable_web_page_preview:true}
             )
ctx.scene.leave("reply");
} catch (err) {
    sendError(err, ctx);
}
    
})

});

getTweet.enter(async (ctx) => {
  getTweet.on("text", async (ctx)=>{
try{
 // const key =  [ [{ text: "🎤 Reply To User", callback_data: "/reply"}]]
    ctx.replyWithMarkdown("*✅ Message Sent To Admin*")
    bot.telegram.sendMessage(await adminId(), "<b>Support Message From :</b>\n<a href='tg://user?id="+ctx.from.id+"'>@"+ctx.from.username+"</a>\n\nMessage:"+ctx.message.text,{parse_mode:"html"//,reply_markup:{inline_keyboard:key}
  ,disable_web_page_preview:true}
             )
  await starter(ctx);
ctx.scene.leave("getTweet");

} catch (err) {
    sendError(err, ctx);
  }
})});
//▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭
//▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭
//getWallet.enter(async (ctx) => await ctx.replyWithMarkdown( `🏁 Please also submit your <b>Polygon (Matic)</b> wallet address. (Format should be 0x + 40 characters hexadecimal)\n\n<b>Note:</b> Please do not use any exchange wallet address.`, { parse_mode: "html", reply_markup: { hide_keyboard: true } } )  .catch((err) => sendError(err, ctx))              );getWallet.leave(async (ctx) => await starter(ctx));getWallet.hears("🔙 back", (ctx) => {ctx.scene.leave("getWallet");});

getWallet.enter( async (ctx) => {
 
   getWallet.on("text",async(ctx) =>{
     try{
    const msg = ctx.message.text;


    if (ctx.message.text.length >= 30) {
      let tr = await db
        .collection("allUsers")
        .find({ address: msg }).toArray();
      
      let cr = await db
        .collection("allUsers")
        .findOne({ userId: ctx.from.id });
      if (await tr.length == 0 || await tr?.userId == await ctx.from.id) {
        
        
        db.collection("allUsers").updateOne(
          { userId: ctx.from.id },
          { $set: { address: msg } },
          { upsert: true }
        );

let key = [
        ["✅ Airdrop Status"],
        ["🔴 Helpdesk", "🔃 Set Wallet"],
        ["⛔️ Cancel"]
      ]
       await  ctx.reply("*Wallet Set* :"+msg,{
     parse_mode:"Markdown",
        reply_markup:{
          keyboard:key,
          resize_keyboard: true,}
      })
     ctx.scene.leave("getWallet");   
      } else {
        ctx.replyWithMarkdown(
          "❌ The Entered Address is Already in Use by Other User! *Please Enter Your Own Address*"
        );
      }
getWallet.hears("⛔ Cancel", (ctx) => {ctx.scene.leave("getWallet");});
    } else {await ctx.replyWithMarkdown("⛔ *Not Valid Address Please Enter Again*");}
  }catch (err) {
    sendInlineError(err, ctx, db);
}
})
});

//▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭
//▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭
//▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭

getMsg.enter(async (ctx) => {
  if (ctx.from.id != (await adminId())) {
    ctx.scene.leave("getMsg");
    return;
  }
  await ctx.replyWithMarkdown(
    " *Okay Admin 👮‍♂, Send your broadcast message*",
    { reply_markup: { keyboard: [["⬅️ Back"]], resize_keyboard: true } }
  );
});

getMsg.leave(async (ctx) => await starter(ctx));

getMsg.hears("⬅️ Back", (ctx) => {
  ctx.scene.leave("getMsg");
});

getMsg.on("text", async (ctx) => {
  ctx.scene.leave("getMsg");
  if (ctx.from.id != (await adminId())) {
    return;
  }

  let admin = await adminId();

  let postMessage = ctx.message.text;
  if (postMessage.length > 3000) {
    return ctx.reply(
      "Type in the message you want to sent to your subscribers. It may not exceed 3000 characters."
    );
  } else {
    globalBroadCast(ctx, admin);
  }
});

//▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭
//▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭
//▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭

addNewChannel.enter(async (ctx) => {
  if (ctx.from.id != (await adminId())) {
    ctx.scene.leave("addNewChannel");
    return;
  }
  await ctx.replyWithMarkdown("*🌀 Send the Channel Username with '@'*", {
    reply_markup: { keyboard: [["⬅️ Return"]], resize_keyboard: true },
  });
});
addNewChannel.leave(async (ctx) => await starter(ctx));
addNewChannel.hears(["🔙 Back", "/start", "⬅️ Return"], async (ctx) => {
  await ctx.replyWithMarkdown(`*🎛️ Channel Adding Process Terminated!*`);
  ctx.scene.leave("addNewChannel");
});
addNewChannel.on("text", async (ctx) => {
  try {
    const msg = ctx.message.text;

    if (ctx.from.id != (await adminId())) {
      ctx.scene.leave("addNewChannel");
      return;
    }

    const len = msg.length + 1;
    const ch = msg.slice(1, len);
    if (msg.slice(0, 1) != "@" || msg.length <= 5) {
      await ctx.replyWithMarkdown(
        "⛔ *Incorrect Username!* _Please send a Correct one or click /start to leave the Operation_"
      );
    } else {
      const chh = await db.collection("channels").find({}).toArray();
      
      if (chh.length===0) {
      } else if (chh.length <= env.maxchnl){
      } else if (chh.length > env.maxchnl){
        ctx.reply("📵 *You cannot Add More than "+env.maxchnl+" Channels!*\n\nℹ You can edit this Limit in /src/env.js file",{ parse_mode: 'Markdown' })
        ctx.scene.leave('addNewChannel')
        return
      }
      let chnl = "";
      if (chh.length === 0) {
      } else {
        const lastChnl = chh.length - 1;
        for (let i = 0; i <= lastChnl; i++) {
          if (chh[i].channel == ch) {
            await ctx.replyWithMarkdown(
              "⛔ *This Channel Already exist in the Database*"
            );
            ctx.scene.leave("addNewChannel");
            return;
          }
        }
      }
      db.collection("channels").insertOne({ channel: ch, joincheck: "fal" });
      await ctx.reply(
        `❇️ <b>Channel :</b> @${ch} <i>has been Added in Database</i>`,
        { parse_mode: "html" }
      );
      ctx.scene.leave("addNewChannel");
    }
  } catch (err) {
    sendError(err, ctx);
  }
});

const stage = new Scenes.Stage(
  [ addPChannel, reply, getTweet, getWallet, getMsg, addNewChannel, chkUsrDet,saveDate, savePerRef, saveMinWith, saveBonus, saveCoinName, addUsrBal, cutUsrBal, addUsrBal2, cutUsrBal2, onWithdraw ],
  {
    ttl: 600,
  }
);

exports.stages = stage.middleware();
