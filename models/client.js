import mongoose from 'mongoose'
let clientSchema = new mongoose.Schema({
    fname: { type: String},
    lname: { type: String },
    email: { type: String, required:true },
    password: { type: String, required:true },
    address: { type: [String] },
    phoneNum:{type:String},
    dateCreated:{type:Date},
});
console.log(mongoose.models)
let Client=mongoose.models.client|| mongoose.model("client",clientSchema)

export default Client;