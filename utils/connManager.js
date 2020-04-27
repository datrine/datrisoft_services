import mongoose from 'mongoose'
let connectionString="mongodb://localhost:27017/datrisoftdb"

mongoose.connect(connectionString,
    {useNewUrlParser:true}).catch(console.error);
  mongoose.connection.on("error",err=>{
      console.log(err)
  });

  mongoose.connection.once("connected",()=>{
      console.log("Connected to db...")
  });