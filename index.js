const express = require('express');
const cors = require("cors");
const mongoose = require('mongoose');
const port = process.env.PORT || 3000;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const app = express();
require("dotenv").config();
app.use(express.json());
// cors use
app.use(cors({ 
  origin: ["http://127.0.0.1:5500"]
}));
//======================================================> 
// Get token from dotenv file
//======================================================> 
const JWT_SECRET = process.env.SECRET_TOKEN;
//======================================================>
// JWT Verify Middleware
//======================================================>
function verifyToken(req, res, next) {
 try {
 const authHeader = req.headers.authorization;
 if (!authHeader) {
  return res.status(401).json({ message: "Token Required" });
 }
// Bearer TOKEN
 const token = authHeader.split(" ")[1];
 if (!token) {
  return res.status(401).json({ message: "Token Required" });
 }
// Verify token
 const decoded = jwt.verify(token, JWT_SECRET);
// usernumber -> this usernumber will be use next route
 req.usernumber = decoded.usernumber;
 next();
// catch -> get error message
 } catch (err) {
  return res.status(401).json({ message: "Invalid or expire token" });
 }
} // jwtverify end
//======================================================>
// get Schema
//======================================================>
const User = require("./models/users");
const Transaction = require("./models/transaction");
const Cards = require("./models/cards");
//======================================================>
// Server response test
//======================================================>
app.get("/", (req, res)=> {
  res.send("Server Activate");
});
//======================================================>
// Mongoose connect
//======================================================>
mongoose.connect(process.env.MONGODB_URI).then(()=> {
  console.log("MongoDB connected Successfully");
}).catch((error)=> {
  console.error("Mongodb connection error:", error);
}); // mongoose connect end

//======================================================>
// Transaction data post
//======================================================>
app.post("/transactions", verifyToken, async(req, res)=> {
 const txndatas = req.body;
 const { pin, amount } = txndatas;
  try {
// Input check
  if (!pin || !amount) {
   return res.status(400).json({message: "Pin and Amount are required"});
  }
 const withdrawAmount = Number(amount);
  if (withdrawAmount <= 0) {
    return res.status(400).json({message: "Invalid amount"});
  }
// Start MongoDB session
 const session = await mongoose.startSession();
  try {
   session.startTransaction();
// Find user using usernumber
 const user = await User.findOne({ usernumber: req.usernumber }).session(session);
  if (!user) {
    await session.abortTransaction();
    return res.status(404).json({message: "User not found"});
 }
// Pin match
 const pinMatch = await bcrypt.compare(pin, user.pin);
 if(!pinMatch) {
   return res.status(401).json({message: "Wrong Pin"});
 }
// Balance check
 if (user.balance < withdrawAmount) {
   await session.abortTransaction();
   return res.status(400).json({message: "Your balance is low"});
 }
// Update balance
 user.balance = user.balance - Number(withdrawAmount);
  await user.save({ session });
// Save transaction
 const result = await Transaction.create([{...txndatas, usernumber: user.usernumber, balance: user.balance}], { session });
// Everything successful
 await session.commitTransaction(); 
  res.status(200).json({message: "Transaction Successfully", txndata: result, balance: user.balance});
 } catch (error) {
  await session.abortTransaction();
  res.status(500).json({message: "Transaction failed"});
 } finally {
  session.endSession();
 }
 } catch (error) {
   res.status(500).json({message: error.message});
  }
}); // Transactions End 
 
//=========================>
// Post -> Pin Verify
//=========================>
app.post("/userpin", async(req, res)=> {
 const { userid, pin } = req.body;
 const user = await User.findOne({ _id: userid, pin: pin });
 try {
 if (!user) {
   return res.status(401).json({ success: false, message: "Pin is incorrect" });
  }
 // Only send the information you need
 res.json({ success: true });

 } catch (error) { res.status(500).json({ success: false, message: "Server error" });}

});

//======================================================>
//  USER REGISTER 
//======================================================>
app.post("/register", async (req, res) => {
 try {
  const userdatas = req.body;
  const { usernumber, password, pin } = userdatas;
// Check user already exists
  const existingUser = await User.findOne({ usernumber });
  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }
// Password hash
  const hashedPassword = await bcrypt.hash(password, 10);
  const hashedPin = await bcrypt.hash(pin, 10);
// Save user
 const newuserdatas = {...userdatas, password: hashedPassword, pin: hashedPin };
  const user = new User(newuserdatas);
   await user.save();
  res.status(201).json({ message: "Registration Successfully" });
// catch -> get error message
 } catch (error) { 
  res.status(500).json({ message: error.message });
 }
}); // Register end
//======================================================>
// Login 
//======================================================> 
app.post("/login", async (req, res) => {
 try {
 const { usernumber, password } = req.body;
// find user
 const user = await User.findOne({ usernumber });
 if (!user) {
  return res.status(401).json({ message: "User not found!" });
 }
 const passwordMatch = await bcrypt.compare( password, user.password );
 if (!passwordMatch) {
  return res.status(401).json({ message: "Invalid password" });
 }
 const token = jwt.sign({ usernumber: user.usernumber }, JWT_SECRET, { expiresIn: "30d" });
 res.json({ message: "Login Successfully", userdatas: user, token: token });
// catch -> get error message
 } catch (error) {
  res.status(500).json({ message: error.message });
 }
}); // Login end 
//======================================================> 
// Protected Profile Route
//======================================================> 
app.get("/profile", verifyToken, async (req, res)=> {
 try {
// get usernumber from tokenVerify 
 const usernumber = req.usernumber;
// find user to database 
 const user = await User.findOne({ usernumber: usernumber }).select("-password -pin");
 if (!user) {
  return res.status(404).json({ message: "User not found" });
 }
 res.json({ message: "You are Authorized", userdatas: user });
 } catch (error) {
  res.status(500).json({ message: error.message });
 }
}); // Profile end
//======================================================>
//======================================================>

//=========================================>
// Post -> Cards data Add
//=========================================>
app.post("/cards", async (req, res) => {
 try {
 const carddatas = req.body;
 const { cardnumber } = carddatas;
 const existingCard = await Cards.findOne({ cardnumber });

 if (existingCard) {
   return res.status(400).json({ error: "This card already added" });
 }
  const newcards = new Cards(carddatas);
  const result = await newcards.save();
  res.status(201).json({ message: result });
 } catch (err) {
   res.status(500).json({ error: err.message });
 }
}); 

//===========================================>
// BUY CARD
//===========================================>
app.post("/cards/buy", async (req, res) => {
 try {
  const { cardbrandname, usernumber, pin } = req.body;
// Check input
 if (!cardbrandname || !usernumber || !pin) {
  return res.status(400).json({message: "Pin are required"});
 }
// Find User
 const user = await User.findOne({usernumber: usernumber});
 if (!user) {
   return res.status(404).json({message: "User not found"});
 }
// PIN match
 if (user.pin !== Number(pin)) {
  return res.status(401).json({message: "Invalid PIN"});
 }
// Find Card
 const card = await Cards.findOne({cardbrandname: cardbrandname, status: "available"});
 if (!card) {
   return res.status(404).json({ message: "Card not found" });
 }
// Card price
 const price = Number(card.price);
  if (isNaN(price) || price <= 0) {
   return res.status(400).json({ message: "Invalid card price" });
 }
// Check Balance
 if (Number(user.balance) < price) {
  return res.status(400).json({ message: "Your balance is low" });
 }
// Remove money from user
 user.balance = Number(user.balance) - price;
// Assign card to user
 card.usernumber = usernumber;
 card.status = "sold";

 const cardnumber = card.cardnumber;
// Save User 
 await user.save();
// Save Card
 await card.save();
// Create Transaction
 const newcarddatas = {brandname: cardbrandname, usernumber, number: cardnumber, amount: price, status: "Complete", balance: user.balance };
 await Transaction.create(newcarddatas);

// Success response
 res.status(200).json({ message: "Card purchased successfully", carddatas: newcarddatas});

 } catch (err) {
   res.status(500).json({ message: "Server error", error: err.message });
 }

}); // BUY CARD End

//=================================================> 
// Get request 
//=================================================>

//=========================================>
// Transaction data get
//=========================================>
app.get("/transactions", async (req, res) => {
 try {
  const usernumber = req.usernumber;
  const page = Number(req.query.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;
  const txndatas = await Transaction.find({ usernumber }).sort({ date: -1 }).skip(skip).limit(limit);
  const total = await Transaction.countDocuments({ usernumber });
  const hasMore = skip + txndatas.length < total;
  res.json({ txndatas, page, total, hasMore });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
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

//=========================================>
// Admin Section 
//=========================================>
//=========================================>
// Admin Transaction data get
//=========================================>
app.get("/AdminTransactions", verifyToken, async (req, res) => {
 try {
  const usernumber = req.usernumber;
 if(Number(usernumber) === Number('01734043322')) {
  const page = Number(req.query.page) || 1;
  const limit = 20;
  const skip = (page - 1) * limit;
  const admintxndatas = await Transaction.find().sort({ date: -1 }).skip(skip).limit(limit);
  const total = await Transaction.countDocuments({ usernumber });
  const hasMore = skip + admintxndatas.length < total;
  res.json({ admintxndatas, page, total, hasMore });
 }else{
  res.json({ message: "Admin number incorrect!" });
 }
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});
//======================================================> 
// Resellers data get from User 
//======================================================> 
app.get("/AdminResellers", verifyToken, async (req, res)=> {
 try {
 const usernumber = req.usernumber;
 if(Number(usernumber) !== Number("01722849877")) {
  return res.json({ message: "Admin number incorrect!" });
 }
 const page = Number(req.query.page) || 1;
 const limit = 20;
 const skip = (page - 1) * limit;
// find reseller to database  
 const resellers = await User.find({ usernumber: usernumber }).select("-password -pin").sort({ date: -1 }).skip(skip).limit(limit);
 if (!resellers) {
  return res.status(404).json({ message: "Reseller not found" });
 } 
 const total = await User.countDocuments({ usernumber });
 const hasMore = skip + resellers.length < total;
 res.json({ message: "You are Authorized", Resellers: resellers, page, total, hasMore });
 } catch (error) {
  res.status(500).json({ message: error.message });
 }
}); // Resellers get data end
//======================================================>
//-------------------------------------------------------------->
// Delete Request
//-------------------------------------------------------------->



// Server Active
app.listen(port, ()=> {
  console.log("Money saver server connected on port ", port);
});