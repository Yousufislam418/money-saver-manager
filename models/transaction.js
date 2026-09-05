const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    brandname: { type: String, required: true },
    usernumber: { type: String, required: true },
    number: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now, expires: 7776000 },
    status: { type: String, required: true },
    balance: { type: Number, required: true },
    txn: { type: Number, unique: true }
},{
    versionKey: false,
    collection: "transaction"
}
);
// txn create + 1
transactionSchema.pre("save", async function () {
 if (!this.isNew) return;
 const lastTxn = await this.constructor.findOne().sort({ txn: -1 });
  this.txn = lastTxn ? lastTxn.txn + 1 : 1;
});
module.exports = mongoose.model("Transaction", transactionSchema);
