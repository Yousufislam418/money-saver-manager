const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    type: {type: String, enum: ["deposit", "withdraw"], required: true},
    brandname: {type: String},
    usernumber: {type: String, required: true},
    number: {type: String},
    amount: {type: Number, required: true},
    txn: {type: Date, default: Date.now, expires: 60 * 60 * 24 * 90},
    status: {type: String},
    balance: {type: Number}
},{
    versionKey: false,
    collection: "transaction"
}
);

module.exports = mongoose.model("Transaction", transactionSchema);
