const mongoose = require('mongoose');

const cardsSchema = new mongoose.Schema({
 cardbrandname: { type: String },
 cardnumber: { type: String, unique: true },
 amount: { type: String },
 date: { type: Number, default: Date.now },
 expire: { type: Date, expires: 2592000 },
 status: { type: String, default: "available" },
 txn: { type: Number, unique: true }
},{
    versionKey: false,
    collection: "cards"
}
);
// Txn id create + 1
cardsSchema.pre("save", async function (next) {
 try {
 if (!this.isNew) return next();
 const lastTxn = await this.constructor.findOne().sort({ txn: -1 });
 this.txn = lastTxn ? lastTxn.txn + 1 : 1;
  next();
 } catch (error) {
  next(error);
 }
});
module.exports = mongoose.model("Cards", cardsSchema);
