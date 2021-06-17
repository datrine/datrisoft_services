const { Server, Socket } = require("socket.io")
function startSocket(server) {
    if (process.env.NODE_ENV !== "production") {
        const { port: PORT } = server.address()
        console.log("Socket io port is..." + PORT)
    }
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
        path:"/socket.io"
    });

    io.on("connection",
        /**
         * @param {Socket} socket
         */
        (socket) => {
            console.log("Connected...")
            console.log(socket.handshake.query.serviceId)
            socket.on("hello", ({ sender }) => {
                console.log(sender)
            })
            io.emit("welcome", "client")
        });

}
module.exports = { startSocket }

