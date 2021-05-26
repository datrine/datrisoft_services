const { Server, Socket } = require("socket.io")
let listOfChannel = new Map();
async function registerChannel({ channelId, }) {
    listOfChannel.set(channelId, { subscribers: new Map() });
}
async function removeChannel({ channelId, }) {
    listOfChannel.delete(channelId);
}

async function addSubscriber({ channelId, subscriberId }) {

}

async function removeSubscriber({ channelId, subscriberId }) {

}

async function verifySubscriber({ channelId, subscriberId }) {
    if (!listOfChannel.has(channelId)) {
        return false
    }
    let channel = listOfChannel.get(channelId);
    if (!listOfChannel.has(channelId)) {
        return false
    }
}

async function sendMessage({ fromId, toId }) {

}

async function sendMessageToChannel({ channelId, toId }) {
 await sendMessage({fromId:channelId})
}