
/*
 * Game routes
 */
var fs = require('fs');

exports.index = function(io){

    //Players
    var players = {};

    io.sockets.on('connection', function (socket) {
        console.log('connected');

        socket.on('addPlayer', function(username){
            socket.username = username;
            players[username] = username;
            socket.emit('updategame', 'SERVER', 'you are ready to play');
        });

        socket.on('playerMove', function (data) {
            io.sockets.emit('updategame', socket.username, data);
        });
    });

    return function(req, res){
        res.render('game', { title: 'Game homepage' });
    };
};
