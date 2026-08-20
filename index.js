const express = require('express');
const mongoose = require('mongoose');
const cors = require("cors");
const port = 5000;
const app = express();
require("dotenv").config();
app.use(express.json());
app.use(cors());


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
app.get("users", async (req,res)=> {
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