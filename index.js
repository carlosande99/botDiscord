import { Client, GatewayIntentBits } from "discord.js";
import { Shoukaku, Connectors } from "shoukaku";
import dotenv from "dotenv";

// Comandos
import { playCommand } from "./commands/play.js";
import { stopCommand } from "./commands/stop.js";
import { skipCommand } from "./commands/skip.js";

dotenv.config();

//Cliente Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

const PREFIX = "!";

//Lavalink nodes
const nodes = [
  {
    name: "main",
    url: "localhost:2333",
    auth: "youshallnotpass",
  },
];

//Shoukaku
const shoukaku = new Shoukaku(new Connectors.DiscordJS(client), nodes);

//Eventos Lavalink
shoukaku.on("ready", (name) => {
  console.log(`🎧 Nodo listo: ${name}`);
});

shoukaku.on("error", (name, error) => {
  console.error(`❌ Error en nodo ${name}:`, error);
});

//Ready
client.once("clientReady", () => {
  console.log(`🤖 Bot listo como ${client.user.tag}`);
});

//Comandos
client.on("messageCreate", async (message) => {
  if (message.author.bot || !message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const cmd = args.shift().toLowerCase();

  try {
    if (cmd === "play") {
      const query = args.join(" ");
      if (!query) {
        return message.reply("❌ Escribe una canción o enlace.");
      }
      if (!message.member.voice.channel) {
        return message.reply("❌ Debes estar en un canal de voz.");
      }

      await playCommand(shoukaku, message, query);
    }

    if (cmd === "stop") {
      await stopCommand(shoukaku, message);
    }

    if(cmd === "skip") {
      await skipCommand(shoukaku, message);
    }


  } catch (error) {
    console.error("❌ Error en comando:", error);
    message.channel.send("❌ Algo salió mal ejecutando el comando.");
  }
});

//Login
client.login(process.env.TOKEN_DISCORD);
