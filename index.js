const http = require("http");
let express = require("express");
let app = express()

let cors = require("cors")

let emailRouter = require("./services/email");
const { startSocket } = require("./services/testings");

//startSocket()

app.use(cors())
app.use(express.json())

app.use("/api/email/", emailRouter);

app.post("/", (req, res, next) => {
    res.json({ served: "ygyugyg" });
    next()
})

app.get("/", (req, res, next) => {
    res.send("<p>Services for <a href='https://www.datrisoft.com'>Datrisoft</a>...</p>");
    next()
});

let server = http.createServer(app)
let PORT = process.env.NODE_ENV === "production" ? process.env.PORT : 5000

server.listen(PORT)

server.on("listening", () => {
    console.log(server.address())
})

//require("./services/chat").startSocket(server)
require("./services/messaging").messagingSocket(server)

server.on("error",err=>{
    console.log(err)
})

server.on("request",(req,res)=>{
   let url= new URL(req.url, `http://${req.headers.host}`);
//console.log(url)
});

module.exports = server;