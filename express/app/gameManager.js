/**
 * Created by david on 2014-08-07.
 */

var User = require('./models/user');
var Game = require('./models/game');

module.exports = function(io) {

    function GameManager() {
        var rules = [
            [[0,0], [-1,1], [1,-1], [1,-1], [-1,1]],
            [[1,-1], [0,0], [-1,1], [-1,1], [1,-1]],
            [[-1,1], [1,-1], [0,0], [1,-1], [-1,1]],
            [[-1,1], [1,-1], [-1,1], [0,0], [1,-1]],
            [[1,-1], [-1,1], [1,-1], [-1,1], [0,0]]
        ];

        var gameList = [];

        function addGame(game) {
            gameList.push(game);
            console.log("game added");
        }

        function removeGame(gameParameters) {
            var i;
            for(i = 0; i < gameList.length; i++ ) {
                if (gameList[i].id === gameParameters.id) {
                    gameList.splice(i, 1);
                    console.log("game removed from the list");
                }
            }
        }

        function handValue(hand) {
            switch (hand) {
                case('rock'):
                    return 0;
                case('paper'):
                    return 1;
                case('scissor'):
                    return 2;
                case('lizard'):
                    return 3;
                case('spock'):
                    return 4;
            }
        }

        function addPlayerHand(playerHand) {
            var game;
            for (game in gameList) {
                if(gameList.hasOwnProperty( game ) && gameList[game].id.indexOf(playerHand.playerId) !== -1) {

                    setPlayerHand(gameList[game], playerHand);

                    if (gameList[game].playerAHand !== null && gameList[game].playerBHand !== null) {
                        return setResult(gameList[game]);
                    }

                    return false;
                }
            }
        }

        function setResult(game)
        {
            var gameResult = rules[handValue(game.playerAHand)][handValue(game.playerBHand)];

            console.log("playerA:" + gameResult[0], "playerB:" +  gameResult[1]);

            if(gameResult[0] == -1) {
                game.winner = game.playerB;
                game.loser  = game.playerA;
            }

            if(gameResult[1] == -1) {
                game.winner = game.playerA;
                game.loser  = game.playerB;
            }

            return game;
        }

        function setPlayerHand(game, playerHand){
            if(playerHand.playerId == game.playerA) {
                game.playerAHand = playerHand.hand;
                return;
            }

            game.playerBHand = playerHand.hand;
        }

        return {
            addGame:       addGame,
            removeGame:    removeGame,
            addPlayerHand: addPlayerHand
        }
    }

    var gameManager = new GameManager();

    io.sockets.on('connection', function (socket) {

        console.log('connected');

        socket.on('addPlayer', function(username){
            socket.username   = username;
            players[username] = username;
            socket.emit('updategame', 'SERVER', 'you are ready to play');
        });

        socket.on('playerMove', function (data) {
            io.sockets.emit('updategame', socket.username, data);
        });

        //Login - Logout
        socket.on('server:connect', function(userFacebook){
            io.sockets.emit('client:connect');
        });

        socket.on('server:disconnect', function(userFacebook){
            console.log('server:disconnect');
            User.findOne({ 'facebook.id' : userFacebook.id }, function(err, user) {
                if (user) {
                    //Update logging time and online status
                    user.facebook.online = false;

                    user.save(function (err) {
                        if (err) {
                            console.log("user not save");
                            return false
                        }

                        // if successful, return user
                        io.sockets.emit('client:disconnect');
                        return true
                    });
                }
            });
        });

        //Invitation
        socket.on('server:invitation', function(game){
            console.log('server:invitation');
            io.sockets.emit('client:invitation', game);
        });

        socket.on('server:accepted', function(game){
            io.sockets.emit('client:accepted', game);
            gameManager.addGame(game);
            saveGame(game);
        });

        socket.on('server:rejected', function(game){
            io.sockets.emit('client:rejected', game);
        });

        socket.on('server:playerHand', function(playerHand) {
            console.log("playerHand", playerHand);
            var game = gameManager.addPlayerHand(playerHand);

            if(game !== false) {
                saveGame(game);
                updateUserResult(game);
                io.sockets.emit('client:result', game);
            }
        });

        function updateUserResult(gameParameters) {

            User.findOne({ 'facebook.id' : gameParameters.playerA }, function(err, user) {

                //an error connecting to the database
                if (err)
                    return done(err);

                if (user) {

                    if(gameParameters.winner === user.facebook.id)
                        user.win = user.win + 1;
                    else if(gameParameters.loser === user.facebook.id)
                        user.lost = user.lost + 1;

                    //TODO - Implement user status

                    user.save(function (err) {
                        if (err)
                            throw err;

                        // if successful, return user
                        console.log('user updated');
                        return true
                    });
                }
            });

            User.findOne({ 'facebook.id' : gameParameters.playerB }, function(err, user) {

                //an error connecting to the database
                if (err)
                    return done(err);

                if (user) {

                    if(gameParameters.winner === user.facebook.id)
                        user.win = user.win + 1;
                    else if(gameParameters.loser === user.facebook.id)
                        user.lost = user.lost + 1;

                    //TODO - Implement user status

                    user.save(function (err) {
                        if (err)
                            throw err;

                        // if successful, return user
                        console.log('user updated');
                        return true
                    });
                }
            });
        }

        function saveGame(gameParameters) {

            if(gameParameters === null || typeof gameParameters === 'undefined') {
                return;
            }

            console.log("Game parameters", gameParameters);

            Game.findOne({ 'id' : gameParameters.id, 'completed': null }, function(err, game) {

                console.log("game creation", game, err);

                //an error connecting to the database
                if (err)
                    return done(err);

                if (game === null) {

                    var newGame = new Game();

                    // set all of the facebook information in our user model
                    newGame.id          = gameParameters.id;
                    newGame.playerA     = gameParameters.playerA;
                    newGame.playerB     = gameParameters.playerB;
                    newGame.playerAHand = null
                    newGame.playerBHand = null;
                    newGame.winner      = null;
                    newGame.createdAt   = new Date().getTime();
                    newGame.completedAt = null;

                    // save our user to the database
                    newGame.save(function(err) {
                        if (err)
                            throw err;

                        return true;
                    });
                } else {
                    //Update logging time and online status
                    game.playerAHand = gameParameters.playerAHand;
                    game.playerBHand = gameParameters.playerBHand;
                    game.winner      = gameParameters.winner;
                    game.loser       = gameParameters.loser;
                    game.completedAt = new Date().getTime();
                    game.misson      = gameParameters.mission;
                    game.publicly    = gameParameters.publicly;
                    game.completed   = new Date().getTime();

                    game.save(function(err) {
                        if (err)
                            throw err;

                        console.log("game updated");
                        gameManager.removeGame(game);
                        return true
                    });
                }
            });
        };
    });
}
