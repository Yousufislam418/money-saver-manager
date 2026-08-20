const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {type: String},
    email: {type: String},
    number: {type: String},
    password: {type: String},
    location: {type: String},
    age: {type: String},
    image: {type: String, default: ''},
    date: {type: String}
},{
    versionKey: false,
    collection: 'users'
}
);

module.exports = mongoose.model('User', userSchema);