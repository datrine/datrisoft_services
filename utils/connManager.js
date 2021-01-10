import mongoose from 'mongoose'
let connectionString="mongodb+srv://datrine:eOyYez3QmV393j2Z@cluster0-qnpau.mongodb.net/unnamedproject"


mongoose.connect(connectionString,
    {useNewUrlParser:true}).catch(console.error);
  mongoose.connection.on("error",err=>{
      console.log(err)
  });

  mongoose.connection.once("connected",()=>{
      console.log("Connected to db...")
  });