let express = require("express");
let app = express()
const PORT=process.env.PORT || 6000
let cors = require("cors")
let emailRouter = require("./services/email")

app.use(cors())
app.use(express.json())

app.post("/testing/", (req, res, next) => {
    res.json({ send: true })
})
app.get("/testing/", (req, res, next) => {
    res.json({ send: true });
})
app.use("/api/email/", emailRouter);

app.post("/", (req, res, next) => {
    res.json({ served: "ygyugyg" });
    next()
})

app.get("/", (req, res, next) => {
    res.send("<p>Services for <a href='https://www.datrisoft.com'>Datrisoft</a>...</p>");
    next()
})
console.log("Loaded...")
app.listen(PORT,() => {
    console.log("Listening..."+PORT)
})