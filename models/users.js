const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    usernumber: { type: String, required: true, unique: true },
    email: { type: String },
    password: { type: String, required: true },
    location: { type: String },
    date: { type: Number, default: Date.now },
    status: { type: String },
    balance: { type: Number, required: true },
    pin: { type: Number, required: true }
},{
    versionKey: false,
    collection: 'users'
}
);

module.exports = mongoose.model('User', userSchema);