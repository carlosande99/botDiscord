import { Client, GatewayIntentBits } from "discord.js";
import { Shoukaku, Connectors } from "shoukaku";
import dotenv from "dotenv";

dotenv.config();
// 🤖 Configuración del cliente de Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates, // Obligatorio para detectar canales de voz
  ],
});

const PREFIX = "!";

// 🌐 Configuración del nodo Lavalink
const nodes = [
  {
    name: "main",
    url: "localhost:2333", // Tu host y puerto de Lavalink
    auth: "youshallnotpass", // Tu contraseña de application.yml
  },
];

// 🎛️ Inicializar Shoukaku
const shoukaku = new Shoukaku(new Connectors.DiscordJS(client), nodes);

// 🔌 Eventos de Shoukaku
shoukaku.on("ready", (name) => {
  console.log(`🎧 Nodo Lavalink listo: ${name}`);
});

shoukaku.on("error", (name, error) => {
  console.error(`❌ Error en el nodo ${name}:`, error);
});

// 🤖 Evento de inicio del Bot
client.once("ready", () => {
  console.log(`🤖 Bot listo como ${client.user.tag}`);
});

// 💬 Manejo de comandos
client.on("messageCreate", async (message) => {
  if (message.author.bot || !message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const cmd = args.shift().toLowerCase();

  // 🎵 COMANDO PLAY
  if (cmd === "play") {
    const query = args.join(" ");
    if (!query) return message.reply("❌ Escribe el nombre de una canción o un enlace.");

    if (!message.member.voice.channel)
      return message.reply("❌ Tienes que estar en un canal de voz.");

    try {
      // 🔗 1. Unirse al canal de voz
      const player = await shoukaku.joinVoiceChannel({
        guildId: message.guild.id,
        channelId: message.member.voice.channel.id,
        shardId: 0,
      });

      // Formatear la búsqueda (si no es URL, busca en YouTube)
      const isUrl = /^https?:\/\//.test(query);
      const search = isUrl ? query : `ytsearch:${query}`;

      // 🔎 2. Buscar pista de audio mediante el nodo asignado al player
      const result = await player.node.rest.resolve(search);

      // Validar si Lavalink no devolvió nada
      if (!result || result.loadType === "empty") {
        return message.reply("❌ No se encontraron resultados para tu búsqueda.");
      }

      if (result.loadType === "error") {
        console.error("Error de Lavalink:", result.data);
        return message.reply("❌ Hubo un error en Lavalink al procesar la canción.");
      }

      let track;

      // 🔀 Extraer el track según el formato estricto de Lavalink v4
      if (result.loadType === "track") {
        track = result.data;          // Enlace directo: data es un Objeto
      } else if (result.loadType === "search") {
        track = result.data[0];       // Búsqueda de texto: data es un Array
      } else if (result.loadType === "playlist") {
        track = result.data.tracks[0]; // Playlist: extrae la primera pista
      }

      if (!track) {
        return message.reply("❌ No se pudo procesar la pista de audio.");
      }

      // 🎵 3. Reproducir (Formato v4 con objeto anidado)
      await player.playTrack({
        track: {
          encoded: track.encoded,
        }
      });

      message.channel.send(`🎶 Reproduciendo ahora: **${track.info.title}**`);
      
    } catch (error) {
        console.error("Error en comando play:", error);
        message.channel.send("❌ Hubo un error al intentar reproducir.");
    }
  }

  // 🛑 COMANDO STOP
  if (cmd === "stop") {
    const player = shoukaku.players.get(message.guild.id);
    if (!player) return message.reply("❌ No hay ninguna canción reproduciéndose.");

    try {
      // Desconectar y limpiar el reproductor en v4
      await shoukaku.leaveVoiceChannel(message.guild.id);
      message.channel.send("🛑 Reproducción detenida y bot desconectado.");
    } catch (error) {
      console.error("Error en comando stop:", error);
      message.channel.send("❌ Hubo un problema al intentar detener el bot.");
    }
  }
});

// 🔑 Pon tu token aquí abajo cuando lo vayas a iniciar
client.login(process.env.TOKEN_DISCORD);