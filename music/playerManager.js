export async function getPlayer(shoukaku, message) {
    const guildId = message.guild.id;

    let player = shoukaku.players.get(guildId);

    if (!player) {
        player = await shoukaku.joinVoiceChannel({
        guildId,
        channelId: message.member.voice.channel.id,
        shardId: message.guild.shardId,
        });
    }

    return player;
}
