const http = require("http");
let express = require("express");
let app = express()

let server = http.createServer(app)
let PORT = process.env.NODE_ENV === "production" ? process.env.PORT : 5000

server.listen(PORT)

let cors = require("cors")

let emailRouter = require("./services/email");
//const { startSocket } = require("./services/testings");

//startSocket()

app.use(cors())
app.use(express.json())

app.use("/api/email/", emailRouter);

//require("./services/chat").startSocket(server)
let messager = require("./services/messaging")
    messager.messagingSocket(server);

app.post("/", (req, res, next) => {
    res.json({ served: "ygyugyg" });
    next()
})

app.get("/", (req, res, next) => {
    res.send("<p>Services for <a href='https://www.datrisoft.com'>Datrisoft</a>...</p>");
    next()
});

server.on("listening", () => {
    console.log(server.address())
    // console.log(app)
})


server.on("error", err => {
    console.log(err)
})

module.exports = server;