import mongoose from 'mongoose'
let projectSchema = new mongoose.Schema({
    name: { type: String, required :true},
    desc: { type: String, required:true },
    dateOfLast: { type: Date },
    imgUrls: { type: [String] },
    dateCreated:{type:Date},
    creatorId:{type:String},
    creatorEmail:{type:String},
    creatorPhoneNum:{type:String},
});
console.log(mongoose.models)
let Project=mongoose.models.project|| mongoose.model("project",projectSchema)

export default Project;