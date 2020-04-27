import Cors from "cors"
const cors=Cors({
    methods:["GET","HEAD","POST"]
})
export default (req,res)=>{
    console.log("Hereeeeeeee")
    if (req.method==="GET") {
        auth=req.headers.authorization
        res.json({auth})
    }
    if (req.method==="POST") {
        auth=req.headers.authorization
        res.json({auth})
    }
}