let express = require("express");
let app = express()

let cors = require("cors")

let emailRouter = require("./services/email")

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
})
console.log(process.env.PORT)
let server = app.listen(process.env.NODE_ENV === "production" ? process.env.PORT : 5000, () => {
    console.log("Listening...")
})

require("./services/chat").startSocket(server)