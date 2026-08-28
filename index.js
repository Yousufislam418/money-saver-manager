const express = require('express');
const cors = require("cors");
const mongoose = require('mongoose');
const port = 5000;
const router = express.Router();

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

//--------------------------------------------------------------->
// Post request 
//--------------------------------------------------------------->

// ------------------------------------------------------>
// Start 
// =========================
// Withdraw
// =========================

app.post("/transactions/withdraw", async (req, res) => {

  const { usernumber, pin, amount } = req.body;

  try {

    // Input check
    if (!usernumber || !pin || !amount) {
      return res.status(400).json({
        message: "User number, PIN and amount are required"
      });
    }

    const withdrawAmount = Number(amount);

    if (withdrawAmount <= 0) {
      return res.status(400).json({
        message: "Invalid amount"
      });
    }


    // Start MongoDB session
    const session = await mongoose.startSession();

    try {

      session.startTransaction();


      // Find user using userNumber
      const user = await User
        .findOne({ usernumber: usernumber })
        .session(session);


      if (!user) {
        await session.abortTransaction();

        return res.status(404).json({
          message: "User not found"
        });
      }


      // PIN match
      if (user.pin !== pin) {
        await session.abortTransaction();

        return res.status(401).json({
          message: "Invalid PIN"
        });
      }


      // Balance check
      if (user.balance < withdrawAmount) {
        await session.abortTransaction();

        return res.status(400).json({
          message: "Your balance is low"
        });
      }


      // Update balance
      user.balance -= withdrawAmount;

      await user.save({ session });


      // Save transaction
      await Transaction.create(
        [{
          usernumber: user.usernumber,
          amount: withdrawAmount,
          type: "withdraw"
        }],
        { session }
      );


      // Everything successful
      await session.commitTransaction();


      res.status(200).json({
        message: "Withdraw successful",
        balance: user.balance
      });


    } catch (error) {

      await session.abortTransaction();

      console.log(error);

      res.status(500).json({
        message: "Transaction failed"
      });

    } finally {

      session.endSession();

    }


  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Server error"
    });

  }

});


// =========================
// Server
// =========================


// End


// ------------------------------------------------------>


// -------------------------------->
// Post -> User Register
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
//----------------------------------->
// Withdrow



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

//--------------------------------------------------------------->
// Get request 
//--------------------------------------------------------------->
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