let nodemailer = require("nodemailer")
let router = require("express").Router()

router.post("/send/", (req, res, next) => {
    if (!req.body) {
        return;
    }
    console.log(req.body)
    let{from,to,text,html,pass,user,host,port}=req.body;
    let transport = nodemailer.createTransport({host,port,auth:{user,pass}});
    transport.sendMail({
        from,
        to,
        text,html
    }, (err, info) => {
        if (err) {
            console.log(err)
            return res.json({err});
        }
        if (info) {
            console.log(info)
            return res.json({info});
        }
    })
})

module.exports = router;