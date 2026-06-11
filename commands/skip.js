export async function skipCommand(shoukaku, message) {
    const player = shoukaku.players.get(message.guild.id);
    if (!player) return message.reply("No hay ninguna canción reproduciéndose.");

    await player.stopTrack();
    message.channel.send("Canción saltada.");
}