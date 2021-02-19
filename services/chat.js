
const { Server, } = require("socket.io")
const io = new Server(7000, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],

    }
});

io.on("connection", (socket) => {
    console.log("Connected")
    socket.join(socket.handshake.query.serviceId)
});



