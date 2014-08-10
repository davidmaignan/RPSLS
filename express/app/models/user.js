/**
 * Created by david on 2014-07-24.
 */
// app/models/user.js
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var userSchema = mongoose.Schema({
    facebook         : {
        id           : String,
        token        : String,
        email        : String,
        name         : String,
        online       : Boolean,
        winner       : Number,
        loser        : Number,
        createdAt    : Date,
        loggedIn     : Date,
        test         : Boolean
    },
    win:  Number,
    lost: Number
});

userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

module.exports = mongoose.model('User', userSchema);
