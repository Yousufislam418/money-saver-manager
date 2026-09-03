const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    brandname: {type: String},
    usernumber: {type: String, required: true},
    number: {type: String},
    amount: {type: Number, required: true},
    txn: {type: Date, default: Date.now, expires: 7776000},
    status: {type: String},
    balance: {type: Number}
},{
    versionKey: false,
    collection: "transaction"
}
);

module.exports = mongoose.model("Transaction", transactionSchema);
