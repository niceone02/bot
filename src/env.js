let botToken;
let mongoUrl;
let adminid;
let rewardpool = '2000'//Reward Pool Of Your Bot in Usdt
let market = 'Binance' //Market on which Your Coin is Available

let twitterlink = '@RoyalDevendra'
//The Above is Your Twitter Account Link which user will Follow
//The Below is Your Twitter Account Name for Above Link which will Show in the Bot
let twittername = 'Royal Devendra'

let tweetlink = 'https://twitter.com/SuperDefi_Dao/status/1617149253113241600?t=WfQxySkbTonxbLYwoUQRbA&s=19'
//The Above is The Post Link which User Have to Like & Repost
//The Below is The Name for Showing the Above Link in the Text
let tweetname = 'Super Defi'

let maxchnl = '6'

if(!process.env.admin){
    adminid = '1834957586' //Put Telegram User ID of Admin of the Bot
}else{
    adminid = process.env.admin
}

if(!process.env.bot_token){
    botToken = '5444390105:AAGplS6dz_73wcGmnftbBxarz00nRgnsajw' //Replace Bot token
}else{
    botToken = process.env.bot_token
}

if(!process.env.mongoLink){
    mongoUrl = 'mongodb+srv://abhishek71599:badvibesiop@cluster0.eo3iiwh.mongodb.net/?retryWrites=true&w=majority' //Put MongoDB URL you can get it from https://mongodb.com/
}else{
    mongoUrl = process.env.mongoLink
}


module.exports = {
mongoLink: mongoUrl,
bot_token: botToken,
admin: adminid,
rewardpool,
market,
tweetlink,
tweetname,
twitterlink,
twittername,
maxchnl
}
