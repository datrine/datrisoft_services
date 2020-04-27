import Cors from "cors"
import { validClient } from '../../../utils/validators'
import Client from '../../../models/client'
import '../../../utils/connManager'
//import nodeMailer from 'nodemailer'
const cors = Cors({
    methods: ["GET", "HEAD", "POST"]
})
export default async (req, res) => {
    try {
        if (req.method === "GET") {
            return res.json({ message: "Here o" })
        }
        if (req.method === "POST") {
            let { password, email } = JSON.parse(req.body);
            if (password && email) {
                Client.findOne({ password, email }, (err, newClient) => {
                    if (err) {
                        return res.json({ err })
                    }
                    if (!newClient) {
                        return res.json({ err: "Email and/or password does not match record" })
                    }
                    //remove pasword and send to client
                    let { password, ...client } = newClient;
                    return res.json(newClient);
                })
            }
            else {
                res.json({ errMsg, info: "Failed to save..." });
            }
        }
    } catch (error) {
        console.log(error)
        return res.json({ error })
    }
}