import { addToQueue, getNextTrack, getQueue } from "./queuManager.js";

export async function handleTrack(player, track, message) {
    const queue = getQueue(message.guild.id);

    if (player.track) {
        addToQueue(message.guild.id, track);
        console.log(getQueue(message.guild.id));
        return message.channel.send(`Añadido a la cola: **${track.info.title}**`);
    }

    await player.playTrack({
        track: {
            encoded: track.encoded,
        },
    });

    message.channel.send(`Reproduciendo ahora: **${track.info.title}**`);

    player.on("trackEndEvent", async () => {
        const next = getNextTrack(message.guild.id);
        if (!next) return;

        await player.playTrack({
            track: {
                encoded: next.encoded,
            },
        });

        message.channel.send(`Siguiente: **${next.info.title}**`);
    });
}