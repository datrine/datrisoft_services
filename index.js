let express=require("express");
let app=express()
let cors=require("cors")
app.use(cors())
app.use(express.json())
let emailRouter=require("./services/email")

app.use("/email/",emailRouter)

app.listen(5000,()=>{
    console.log("Listening...")
})