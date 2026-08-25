const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    brandname: {type: String},
    usernumber: {type: String},
    number: {type: String},
    amount: {type: String},
    txn: {type: Date, default: Date.now, expires: 60 * 60 * 24 * 90},
    status: {type: String},
    balance: {type: String}
},{
    versionKey: false,
    collection: "transaction"
}
);

module.exports = mongoose.model("Transaction", transactionSchema);
