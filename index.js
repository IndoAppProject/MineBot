const { Client, GatewayIntentBits, WebhookClient, MessageEmbed } = require('discord.js');

//McBot Code
const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals: { GoalNear } } = require('mineflayer-pathfinder');
const pvp = require('mineflayer-pvp').plugin;
const autoeat = require('mineflayer-auto-eat').plugin;
const armorManager = require("mineflayer-armor-manager");
const toolPlugin = require('mineflayer-tool').plugin
const { Vec3 } = require('vec3');

//config bot
let bot;
const targets = [];
let lastAttackTime = 0;
let mcData;

//bot function area
function createBot() {

//config bot
bot = mineflayer.createBot({
  host: '0.0.0.0', // Ganti dengan alamat server Minecraft
  port: 25565, // Ganti dengan port server Minecraft
  version: "1.20.1",
  viewDistance: 8,
  username: 'MiawMC100' // Ganti dengan username bot
});

//code bot untuk log bergabung ke server dan auto attack entity kecuali player
bot.once('spawn', () => {
  console.log('Bot telah bergabung ke server Minecraft');
  bot.chat('/register yourpassword123');
  bot.chat('/login yourpassword123');
});

//spawn melihat inventory dan memakainya
bot.once("spawn", () => bot.armorManager.equipAll());

bot.once('spawn', () => {
  mcData = require('minecraft-data')(bot.version)
})

//plugin load
bot.loadPlugin(require('mineflayer-collectblock').plugin)
bot.loadPlugin(pathfinder);
bot.loadPlugin(pvp);
bot.loadPlugin(autoeat)
bot.loadPlugin(armorManager);
bot.loadPlugin(toolPlugin)

//WebUooak Discord Area
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});


const webhookURL = 'your discord webhook url';

const sendWebhookMessage = async (content) => {
  const { webhookID, webhookToken } = getWebhookInfo(webhookURL);

  const webhook = new WebhookClient({ id: webhookID, token: webhookToken });

  await webhook.send({
    content: content,
    username: 'MiawMC',
  });

  webhook.destroy();
};

const getWebhookInfo = (webhookURL) => {
  const matches = webhookURL.match(/\/webhooks\/(\d+)\/(.+)/);

  if (!matches || matches.length !== 3) {
    throw new Error('Invalid webhook URL');
  }

  const [_, webhookID, webhookToken] = matches;
  return { webhookID, webhookToken };
};

//BotMisc
bot.on('chat', (username, message) => {
 const detectNewMessage = async () => {
 const { webhookID, webhookToken } = getWebhookInfo(webhookURL);

  const webhook = new WebhookClient({ id: webhookID, token: webhookToken });

  await webhook.send({
    content: message,
    username: username,
  });

  webhook.destroy();
 }
 detectNewMessage();
 console.log(`${username} : ${message}`);
});

//auto attack
bot.on('physicTick', async () => {
  let entity = null
  // Do not attack mobs if the bot is to far from the guard pos
  if (bot.entity.position.distanceTo(bot.entity.position) < 16) {
    // Only look for mobs within 16 blocks
   const filter = e => (e.type === 'hostile' || e.type === 'mob') && e.position.distanceTo(bot.entity.position) < 10 && e.mobType !== 'Armor Stand'

    entity = bot.nearestEntity(filter)
  }

  if (entity != null) {
    // If we have an enemy and we are not moving back to the guarding position: Start attacking
    bot.pvp.attack(entity)
  } else {
    await bot.pvp.stop()
  }
});

//auto eat
bot.on('autoeat_started', (item, offhand) => {
  try {
    console.log(`Eating ${item.name} in ${offhand ? 'offhand' : 'hand'}`)
  } catch(e) {
    bot.chat('aku butuh makanan!');
   bot.chat(`/give ${bot.username} bread`);
  }
})

bot.on('autoeat_finished', (item, offhand) => {
    console.log(`Finished eating ${item.name} in ${offhand ? 'offhand' : 'hand'}`)
})

bot.on('autoeat_error', console.error)

//auto reconnect
bot.on('end', () => {
    console.log('Bot terputus dari server');
    setTimeout(() => {
      console.log('Mencoba untuk terhubung kembali...');
      createBot();
    }, 5000); // Waktu delay sebelum mencoba terhubung kembali (dalam milidetik)
  });

//Message indentifier
client.on('messageCreate', async (message) => {
 const args = message.content.split(' ');
  if (args[0].toLowerCase() === '!sendwebhook' && message.author.id === '825873633355759617') {
    try {
      await sendWebhookMessage('Hello from the webhook!');
      message.reply('Webhook message sent!');
    } catch (error) {
      console.error('Error sending webhook message:', error.message);
      message.reply('Failed to send webhook message.');
    }
  }
  if (args[0].toLowerCase() === '!chat' && message.author.id === '825873633355759617') {
    try {
      if (args.length >= 2) {
  // Menggabungkan args[1] dan seterusnya
      const combinedArgs = args.slice(1).join(' ');
      bot.chat(combinedArgs);
      }
      } catch (error) {
      console.error('Error sending webhook message:', error.message);
      message.reply('Failed to send webhook message.');
    }
  }
});

client.login('discord bot token');
}

createBot();
