const { Server, Socket } = require("socket.io")
const httpServer = require("../index");
const { myCache } = require("../utils/cache");
const { clientChatTemplate, serverMeta } = require("../utils/socket_template");
const { nanoid } = require("nanoid");

/**
 * @type {Server}
 */
let io;
/**
 * 
 * @param {import("http").Server} httpServer 
 */
function messagingSocket(httpServer) {
    io = new Server(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
        path: "/"
    });

    /**
     * @param {Socket} socket
     */
    let callback = async (socket) => {
        //console.log("Client ID " + socket.id)
        let room_id = socket.handshake.auth.room_id
        if (!room_id) {
            return clientErrorFn({ emitName: "no_room_id", socket })
        }
        console.log("Room Id for socket just added, " + socket.id + ", is " + room_id)
        Promise.resolve(socket.join(room_id)).then(() => {
            myCache.primeClient(room_id);
        });
        //msgs to forward to another client
        socket.on('to_client', async (data) => {
            try {
                //console.log("Received client msg");
                let msgObj = await processMsg(data);
                await processBacklog(data.reciepient_id);
                let sockets = await io.in(data.reciepient_id).fetchSockets();
                console.log("socket count: " + sockets.length)
                for (const sck of sockets) {
                    sck.emit("client_msg", msgObj, (ack) => {
                        console.log(ack);
                    });
                }
            } catch (error) {
                console.log(error)
                if (error.type === "client") {
                    //console.log("Client error");
                }
                if (error.errEmit) {
                    let { msg } = error
                    return socket.emit(error.errEmit, { msg })
                }
            }
        });
    }

    /**
     * 
     * @param {io} server 
     * @param {string} clientId 
     */

    io.on("connection", callback);

    io.of("/").on("connection", (socket) => {
        //console.log("Connected: " + socket.id)
    });

    io.of("/").on("error", (err) => {
        //console.log(err)
    });
}

/**
 * 
 * @param {clientChatTemplate} client_msg 
 */

async function processMsg(client_msg) {
    if (!client_msg.sender_id) {
        //console.log("No sender_id")
        throw { errEmit: "no_sender_id", msg: "sender_id field not emitted", type: "client" }
    }
    let id = nanoid();
    client_msg.id = id
    let processedMsg = { ...client_msg, ...serverMeta };
    await myCache.saveToDBThenClient(client_msg.reciepient_id, processedMsg)
    return processedMsg;
}

async function processBacklog(client_id,opts={}) {
    if (!client_id) throw { errEmit: "sender_id", msg: "sender_id field cannot be emit" }
    let storedMsgsMeta = await myCache.findClientMsgs(client_id,opts);
    let storedMsgs = storedMsgsMeta.docs;
    let sockets = await io.in(client_id).fetchSockets();
    console.log("messages: " + storedMsgs.length + ", sockets: " + sockets.length);
    if (storedMsgs.length > 0) {
        for (const msg of storedMsgs) {
            for (const sck of sockets) {
                sck.emit("back_log", msg, ack => {
                    //if an acknowledgement is received, delete
                    console.log(ack);
                })
            }
        }
    }
}
/**
 * 
 * @param {object} param,
 * @param {string} param.emitName,
 * @param {object} param.data,
 * @param {Socket} param.socket,
 */
async function clientErrorFn({ emitName = "client_error", data = { errType: "client" }, socket }) {
    socket.emit(emitName, data);
}
module.exports = { messagingSocket }



