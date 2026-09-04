const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    brandname: {type: String},
    usernumber: {type: String, required: true},
    number: {type: String},
    amount: {type: Number, required: true},
    date: {type: Date, default: Date.now, expires: 7776000},
    status: {type: String},
    balance: {type: Number},
    txn: {type: Number, unique: true}
},{
    versionKey: false,
    collection: "transaction"
}
);
// txn create + 1
cardsSchema.pre("save", async function(next) {
 if (!this.isNew) return next();
 const lastTxn = await this.constructor.findOne().sort({ txn: -1 });
  this.txn = lastTxn ? lastTxn.txn + 1 : 1;
  next();
});

module.exports = mongoose.model("Transaction", transactionSchema);
