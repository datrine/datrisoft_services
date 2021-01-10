import Cors from "cors"
import { validCreateProject } from '../../utils/validators'
import Project from '../../models/project'
import '../../utils/connManager'
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
            // let {}=req.body
            let {project}=JSON.parse(req.body);
            let { isValid, name, desc, dateOfLast,creatorEmail,creatorId } = 
            validCreateProject({ ...project })
            
            console.log(`isValid: ${name} name:${name}`)
            if (isValid) {
                let newProject = new Project({
                    name,
                    desc,
                    dateOfLast,
                    creatorEmail,
                    creatorId,
                })
                let savedProject = await newProject.save();
                console.log(savedProject)
                res.json({name,desc,projectId:savedProject.id});
            }
        }
    } catch (error) {
        return res.json({error})
    }
}