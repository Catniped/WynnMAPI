const mineflayer = require('mineflayer')

const bot = mineflayer.createBot({
  host: 'localhost', // minecraft server ip
  username: 'Bot', // username to join as if auth is `offline`, else a unique identifier for this account. Switch if you want to change accounts
  auth: 'offline' // for offline mode servers, you can set this to 'offline'
})

bot._client.on("advancements", console.log)

// Log errors and kick reasons:
bot.on('kicked', console.log)
bot.on('error', console.log)