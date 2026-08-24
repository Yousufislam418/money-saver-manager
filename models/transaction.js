const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    brandname: {type: String},
    usernumber: {type: String},
    number: {type: String},
    amount: {type: String},
    txn: {type: String},
    status: {type: String},
    balance: {type: String}
},{
    versionKey: false,
    collection: "transaction"
}
);

module.exports = mongoose.model("Transaction", transactionSchema);
