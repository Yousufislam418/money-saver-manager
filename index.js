const express = require('express');
const mongoose = require('mongoose');
const cors = require("cors");
const port = 5000;
const app = express();
require("dotenv").config();
app.use(express.json());

// cors use
app.use(cors({
  origin: ['http://127.0.0.1:5500'],
  credentials: true
}));


const User = require("./models/users");

app.get("/", (req,res)=> {
  res.send("Server Activate");
});

mongoose.connect(process.env.MONGODB_URI).then(()=> {
  console.log("MongoDB connected Successfully");
}).catch((error)=> {
  console.error("Mongodb connection error:", error);
});

// -------------------------------->
// User data post : User Register
app.post("/users", async (req,res)=> {
  const userdatas = req.body;
  const {usernumber} = userdatas;
  const existingUser = await User.findOne({usernumber});
  try{
   if(existingUser){
    return res.status(400).json({error: 'User already create'});
   }else{
    const users = new User({userdatas});
    const result = await users.save();  
    res.status(201).json(result);
   }
 }catch(err){
   res.status(403).json({error: err});
 }
});



// -------------------------------->
app.get("/users", async (req,res)=> {
  try{
    const user = await User.find();
    res.json(user).send(user);

  } catch (error) {
    res.status("err", error);
  }
});


app.listen(port, ()=> {
  console.log("Money saver server connected on port ", port);
});