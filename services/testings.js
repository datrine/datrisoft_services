//import { nanoid } from "nanoid";
const { io } = require("socket.io-client");
const startSocket = async () => {
    
    const socket = io(`http://localhost:5000`, {
        rejectUnauthorized: false,
        path: "/",
        auth: {
            room_id: "myspace4you"
        },
        autoConnect: true
    });

    console.log("Socket..ni...ooo..");

    socket.on("error", (err) => {
        console.log(err);
    });

    socket.on("open", () => {
        console.log("Connected...");
    });

    socket.on("connect", () => {
        console.log("Connected to server...")
    });
    return socket;
}

module.exports = { startSocket };