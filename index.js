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
const Cards = require("./models/cards");

app.get("/", (req,res)=> {
  res.send("Server Activate");
});
// mongoose connect
mongoose.connect(process.env.MONGODB_URI).then(()=> {
  console.log("MongoDB connected Successfully");
}).catch((error)=> {
  console.error("Mongodb connection error:", error);
});

//=============================================>
// Post request 
//==============================================>
//=========================>
// Transaction data post
//=========================>
app.post("/transactions", async(req, res)=> {
 const txndatas = req.body;
 const { usernumber, pin, amount } = txndatas;
  try {
// Input check
  if (!usernumber || !pin || !amount) {
   return res.status(400).json({message: "User number, PIN and amount are required" });
  }

 const withdrawAmount = Number(amount);
  if (withdrawAmount <= 0) {
    return res.status(400).json({message: "Invalid amount"});
  }

// Start MongoDB session
 const session = await mongoose.startSession();
  try {
   session.startTransaction();
// Find user using userNumber
 const user = await User.findOne({ usernumber: usernumber }).session(session);
  if (!user) {
    await session.abortTransaction();
    return res.status(404).json({message: "User not found"});
 }

// PIN match
 if (user.pin !== pin) {
  await session.abortTransaction();
  return res.status(401).json({message: "Invalid PIN"});
 }

// Balance check
 if (user.balance < withdrawAmount) {
   await session.abortTransaction();
   return res.status(400).json({message: "Your balance is low"});
 }

// Update balance
 user.balance = user.balance - withdrawAmount;
  await user.save({ session });

// Save transaction
 await Transaction.create([{...txndatas, balance: user.balance}], { session });

// Everything successful
 await session.commitTransaction();
  res.status(200).json({message: "Transaction Successfully", balance: user.balance});
 } catch (error) {
  await session.abortTransaction();
  res.status(500).json({message: "Transaction failed"});
 } finally {
  session.endSession();
 }
 } catch (error) {
   res.status(500).json({message: "Server error"});
  }
});

//=========================>
// Post -> User Register
//=========================>
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
//=========================>
// Post -> Pin Verify
//=========================>
app.post("/userpin", async(req, res)=> {
 try {
  const { userid, pin } = req.body;
  const user = await User.findOne({ _id: userid, pin: pin });
 if (!user) {
   return res.status(401).json({ success: false, message: "Pin is incorrect" });
  }
 // Only send the information you need
 res.json({ success: true });

 } catch (error) { res.status(500).json({ success: false, message: "Server error" });}

});
//=========================>
// Post -> Login 
//=========================>
app.post("/login", async (req,res)=> {
 const { usernumber, password } = req.body;
 try {
 const user = await User.findOne({ usernumber });
 if(!user) {
  return res.json({success: false, message: "User not found!"});
 }
// password match
// const isMatch = await bcrypt.compare(password, user.password);
 if(user.password !== password) { 
  return res.json({success: false, message: "Wrong password"});
 }
// Login successful
 res.json({success: true, message: "Login successful", 
  user: {id: user._id, username: user.username, usernumber: user.usernumber, balance: user.balance}
 });

  } catch (error) {
   res.status(500).json({success: false, message: "Server error"});
 }
});
//=========================================>
// Post -> Cards data Add
//=========================================>
app.post("/cards", async (req,res)=> {
  const carddatas = req.body;
  const { cardnumber } = carddatas;
  const existingCard = await Cards.findOne({cardnumber});
  try{
   if(existingCard){
    return res.status(400).json({error: 'This card already added'});
   }else{
    const newcards = new Cards(carddatas);
    const result = await newcards.save();  
    res.status(201).json(result);
   }
 }catch(err){
   res.status(403).json({message: err});
 }
});
//=================================================>
// Get request 
//=================================================>
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




//-------------------------------------------------------------->
// Update Request
//-------------------------------------------------------------->

// UPDATE -> user data update
app.put('/users/:id', async(req,res)=> {
 try{
  const id = req.params.id;
  const datas = req.body;   
  const result = await User.findByIdAndUpdate(id, datas, {new: true});
  res.json(result).send(result); 
 }catch(error){
  res.status(500).send(error);
 }
});


//-------------------------------------------------------------->
// Delete Request
//-------------------------------------------------------------->



// Server Active
app.listen(port, ()=> {
  console.log("Money saver server connected on port ", port);
});