let express = require("express");
let app = express()
let cors = require("cors")
app.use(express.json())
let emailRouter = require("./services/email")
app.use(cors())

app.post("/testing/", (req, res, next) => {
    res.json({ send: true })
})
app.get("/testing/", (req, res, next) => {
    res.json({ send: true })
})
app.use("/email/", emailRouter)

app.post("/", (req, res, next) => {
    res.json({ served: "ygyugyg" });
    next()
})

app.get("/", (req, res, next) => {
    res.send("<p>Services for <a href='https://www.datrisoft.com'>Datrisoft</a>...</p>");
    next()
})
console.log("Loaded...")
app.listen(5000, () => {
    console.log("Listening...")
})