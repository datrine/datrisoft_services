let express=require("express");
let app=express()
let cors=require("cors")
app.use(cors())
app.use(express.json())
let emailRouter=require("./services/email")

app.use("/",(req,res,next)=>{
res.send("<p>Services for <a href='https://www.datrisoft.com'>Datrisoft</a>...</p>");
})
app.use("/email/",emailRouter)
console.log("Loaded..")
app.listen(5000,()=>{
    console.log("Listening...")
})