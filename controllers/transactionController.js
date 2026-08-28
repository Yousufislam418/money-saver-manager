const mongoose = require("mongoose");
const User = require("../models/users");
const Transaction = require("../models/transaction");

const withdraw = async (req, res) => {
const { usernumber, pin, amount } = req.body;

 const session = await mongoose.startSession();
 try {
 session.startTransaction();
// 1️⃣ Find user
 const user = await User.findOne({usernumber: usernumber}).session(session);
  if (!user) {
   await session.abortTransaction();
   return res.status(404).json({message: "User not found"});
  }

// 2️⃣ PIN match
if (user.pin !== pin) {
  await session.abortTransaction();
  return res.status(401).json({message: "Invalid PIN"});
}

// 4️⃣ Update balance
 user.balance = Number(user.balance) - Number(amount);
 await user.save({ session });

// 5️⃣ Save transaction
 await Transaction.create([{amount: Number(amount), type: "withdraw"}], { session });

// 6️⃣ Everything successful

 await session.commitTransaction();
  res.status(200).json({message: "Withdraw successful", balance: user.balance});

  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({message: "Something went wrong"});

  } finally {
    session.endSession();
  }

};

module.exports = { withdraw };