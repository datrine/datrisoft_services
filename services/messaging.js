const { Server, Socket } = require("socket.io")
const { myCache } = require("../utils/cache/index");
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
        path: "/chats"
    });

    /**
     * @param {Socket} socket
     */
    let callback = async (socket) => {
        let { room_id, ...restOfAuth } = socket.handshake.auth
        if (!room_id) {
            return clientErrorFn({ emitName: "no_room_id", socket })
        }
        Promise.resolve(socket.join(room_id)).then(async () => {
            console.log("Room Id for socket just added, " + socket.id + ", is " + room_id)
            await myCache.primeClient(room_id, { ...restOfAuth });
            console.log("restOfAuth: " + restOfAuth.limit + " : " + restOfAuth.skip);
            await processBacklog(room_id, { ...restOfAuth })
        }).catch(err => { console.log(err) });
        //msgs to forward to another client
        socket.on('to_client', async (data) => {
            try {
                console.log("Received client msg from " + data.sender_id);
                let msgObj = await processMsg(data, { updateCache: false });
                let sockets = await io.in(data.recipient_id).fetchSockets();
                console.log("Sockets to send to: " + sockets.length);
                for (const sck of sockets) {
                    sck.emit("client_msg", msgObj, (ackObj) => {
                        if (ackObj.mode==="sync") {
                            
                        }
                        console.log(ackObj);
                        console.log(data);
                        console.log("socket count for " + data.recipient_id + " : " + sockets.length)
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

        socket.on("fetch_backlog", (fetchDirectives, ack) => {
            console.log(socket.handshake.auth);
            let room_id = socket.handshake.auth.room_id
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

async function processMsg(client_msg, { updateCache = true }) {
    try {
        if (!client_msg.sender_id) {
            throw { errEmit: "no_sender_id", msg: "sender_id field not emitted", type: "client" }
        }
        let id = nanoid();
        client_msg.id = id
        let processedMsg = {
            ...client_msg, ...serverMeta,
            time_stamp_server_received: new Date().toISOString()
        };
        await myCache.saveToDBThenClient(client_msg.recipient_id, processedMsg, updateCache)
        return processedMsg;
    } catch (error) {
        console.log(error)
    }
}

async function processBacklog(client_id, opts = {}) {
    try {
        if (!client_id) throw { errEmit: "sender_id", msg: "sender_id field cannot be emit" }
        let storedMsgsMeta = await myCache.findClientMsgs(client_id, opts);
        if (!storedMsgsMeta) {
            console.log("No storedMsgsMeta for " + client_id)
            return
        }
        let storedMsgs = [...storedMsgsMeta.docs].reverse();
        let sockets = await io.in(client_id).fetchSockets();
        console.log("messages: " + storedMsgs.length + ", sockets: " + sockets.length + ", to: " + client_id);
        if (storedMsgs.length > 0) {
            for (const msg of storedMsgs) {
                for (const sck of sockets) {
                    console.log("Index of : " + storedMsgs.indexOf(msg));
                    if (storedMsgs.indexOf(msg) === 0) {
                        console.log("Start of broadcast...")
                        msg.start = true
                    }
                    if (storedMsgs.indexOf(msg) === storedMsgs.length - 2) {
                        // console.log(msg)
                    }
                    if (storedMsgs.indexOf(msg) === storedMsgs.length - 1) {
                        //console.log(msg)
                        msg.end = true
                    }
                    sck.emit("back_log", msg, ack => {
                        //if an acknowledgement is received, delete
                        console.log(ack);
                        processBacklog(client_id, ack)
                    })
                }
            }
        }
        if (storedMsgs.length > 0) {
            storedMsgsMeta.lastSeekCount = storedMsgs.length
            storedMsgsMeta.lastSeekFFirstItemID = storedMsgs[0]._id
        }
    } catch (error) {
        console.log(error)
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



