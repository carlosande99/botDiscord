const queues = new Map();

//Devuelve la cola de un guild, o crea una nueva si no existe
export function getQueue(guildId) {
    if (!queues.has(guildId)) {
        queues.set(guildId, []);
    }
    return queues.get(guildId);
}

//Agrega un track a la cola
export function addToQueue(guildId, track) {
    const queue = getQueue(guildId);
    queue.push(track);
}

//Devuelve el siguiente track o undefined si la cola está vacía
export function getNextTrack(guildId) {
    const queue = getQueue(guildId);
    return queue.shift();
}

//Opcional: Limpiar la cola
export function clearQueue(guildId) {
    queues.delete(guildId);
}
