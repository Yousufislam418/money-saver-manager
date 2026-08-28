const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    userid: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    type: {type: String, enum: ["deposit", "withdraw"], required: true},
    brandname: {type: String},
    usernumber: {type: String},
    number: {type: String},
    amount: {type: Number, required: true},
    txn: {type: Date, default: Date.now, expires: 60 * 60 * 24 * 90},
    status: {type: String},
    balance: {type: String}
},{
    versionKey: false,
    collection: "transaction"
}
);

module.exports = mongoose.model("Transaction", transactionSchema);
