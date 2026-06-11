export async function stopCommand(shoukaku, message, query) {
  const player = shoukaku.players.get(message.guild.id);
  if (!player) return message.reply("No hay ninguna canción reproduciéndose.");

  try {
    //Desconectar y limpiar el reproductor en v4
    await shoukaku.leaveVoiceChannel(message.guild.id);
    message.channel.send("Reproducción detenida y bot desconectado.");
  } catch (error) {
    console.error("Error en comando stop:", error);
    message.channel.send("Hubo un problema al intentar detener el bot.");
  }
}