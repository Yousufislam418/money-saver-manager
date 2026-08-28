const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {type: String},
    usernumber: {type: String, required: true, unique: true},
    email: {type: String},
    password: {type: String},
    location: {type: String},
    dates: {type: String},
    status: {type: String},
    balance: {type: Number, default: 0},
    pin: {type: String}
},{
    versionKey: false,
    collection: 'users'
}
);

module.exports = mongoose.model('User', userSchema);