import Cors from "cors"
import { validClient } from '../../../utils/validators'
import Client from '../../../models/client'
import '../../../utils/connManager'
//import nodeMailer from 'nodemailer'
const cors = Cors({
    methods: ["GET", "HEAD", "POST"]
})
export  default  async(req, res) => {
    try {
        if (req.method === "GET") {
            return res.json({ message: "Here o" })
        }
        if (req.method === "POST") {
            let client=JSON.parse(req.body);
            console.log(client)
            let { isValid, fname, lname, email,address,password,phoneNum,errMsg } = validClient(client)
            
            if (isValid) {
                let newClient= new Client({
                    fname,
                    lname,
                    email,
                    password,
                    phoneNum,
                    address,
                })
                let savedClient = await newClient.save();
                console.log(savedClient)
                res.json({lname,fname,email,phoneNum,clientId:savedClient.id});
            }
            else{
                res.json({errMsg,info:"Failed to save..."});
            }
        }
    } catch (error) {
        console.log(error)
        return res.json({error})
    }
}