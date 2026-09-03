const mongoose = require('mongoose');

const cardsSchema = new mongoose.Schema({
 cardbrandname: {type: String, required: true},
 cardnumber: {type: String, required: true, unique: true},
 amount: {type: Number, required: true},
 expires: {type: Date, expires: 2592000},
 status: {type: String, default: "available"},
 serialno: {type: Number, unique: true}
},{
    versionKey: false,
    collection: "cards"
}
);
// Serial no create + 1
cardsSchema.pre("save", async function(next) {
 if (!this.isNew) return next();
 const lastUser = await this.constructor.findOne().sort({ serialno: -1 });
  this.serialno = lastUser ? lastUser.serialno + 1 : 1;
  next();
});

module.exports = mongoose.model("Cards", cardsSchema);
