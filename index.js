let express = require("express");
let app = express()
let cors = require("cors")
app.use(express.json())
let emailRouter = require("./services/email")

var whitelist = ['http://localhost:3000', 'http://example2.com']
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}

app.use(cors(corsOptions))

app.use("/", (req, res, next) => {
    res.send("<p>Services for <a href='https://www.datrisoft.com'>Datrisoft</a>...</p>"); 7
    next()
})
app.post("/testing", (req, res, next) => {
    res.json({ send: true })
})
app.get("/testing", (req, res, next) => {
    res.json({ send: true })
})
app.use("/email/", emailRouter)
console.log("Loaded..")
app.listen(5000, () => {
    console.log("Listening...")
})