import { getPlayer } from "../music/playerManager.js";
import { handleTrack } from "../music/musicHandler.js";

export async function playCommand(shoukaku, message, query) {
  const player = await getPlayer(shoukaku, message);

  const isUrl = /^https?:\/\//.test(query);
  const search = isUrl ? query : `ytsearch:${query}`;

  const result = await player.node.rest.resolve(search);

  if (!result || result.loadType === "empty") {
    return message.reply("No se encontraron resultados.");
  }

  let track;

  if (result.loadType === "track") track = result.data;
  if (result.loadType === "search") track = result.data[0];
  if (result.loadType === "playlist") track = result.data.tracks[0];

  if (!track) return message.reply("Error al procesar.");

  await handleTrack(player, track, message);
}