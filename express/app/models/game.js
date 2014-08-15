/**
 * Created by david on 2014-07-24.
 */
// app/models/user.js
var mongoose = require('mongoose');

var gameSchema = mongoose.Schema({
    playerA     : Number,
    playerB     : Number,
    id          : String,
    playerAHand : String,
    playerBHand : String,
    winner      : Number,
    loser       : Number,
    mission     : String,
    publicly    : Boolean,
    completed   : Boolean,
    createdAt   : Date,
    completedAt : Date
});

module.exports = mongoose.model('Game', gameSchema);