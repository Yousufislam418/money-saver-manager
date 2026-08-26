const express = require('express');
const cors = require("cors");
const mongoose = require('mongoose');
const port = 5000;
const app = express();
require("dotenv").config();
app.use(express.json());

// cors use
app.use(cors({ 
  origin: ["http://127.0.0.1:5500"]
}));

// get Schema
const User = require("./models/users");
const Transaction = require("./models/transaction");

app.get("/", (req,res)=> {
  res.send("Server Activate");
});

mongoose.connect(process.env.MONGODB_URI).then(()=> {
  console.log("MongoDB connected Successfully");
}).catch((error)=> {
  console.error("Mongodb connection error:", error);
});

// All Post Request ----------------------------------------------->
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
    const users = new User(userdatas);
    const result = await users.save();  
    res.status(201).json(result);
   }
 }catch(err){
   res.status(403).json({error: err});
 }
});

//--------------------------------> 
// transaction data post
app.post("/transaction", async (req,res)=> { 
 const txndatas = req.body;
 const {usernumber, pin} = txndatas;
 const existingUserPin = await User.findOne({usernumber: usernumber, pin: pin});
  try{
   if(existingUserPin){
    const txndata = new Transaction(txndatas);
    const result = await txndata.save();  
    res.status(201).json(result);
   }else{
    return res.status(400).json({error: "Transaction failed"});
   }
  } catch (error) {
    res.status("err", error);
  }
});

// All get request ----------------------------------------------->
// -------------------------------->
// get user one
app.get("/users/:usernumber", async (req,res)=> { 
  try{
    const user = await User.findOne({usernumber: req.params.usernumber}).select("-password -pin");
    res.json(user).send(user);

  } catch (error) {
    res.status("err", error);
  }
});


//--------------------------------> 
// transaction get data by usernumber
app.get("/transaction/:usernumber", async (req,res)=> { 
  try{
    const txndata = await Transaction.find({usernumber: req.params.usernumber});
    res.json(txndata).send(txndata);

  } catch (error) {
    res.status("err", error);
  }
});



// Server Active
app.listen(port, ()=> {
  console.log("Money saver server connected on port ", port);
});