/**
 * Created by david on 2014-08-07.
 */

var User = require('../app/models/user');

module.exports = function(io, eventEmitter, db) {


    function gameManager() {
        var gameList = {};


        function game(player) {

            var playerA = new Player(player)

            function addPlayer(player)
            {
                if(playerA){
                    playerA = new Player(player);
                    return;
                }

                playerB
            }

            function Player(player) {
                var name = player.name,
                    id   = player.id;
            }
        }
    }

    io.on('connection', function(socket){

        eventEmitter.on('user:joined', function(user){
            io.emit('user:list');
        });

        //Send a user connection
        console.log('RPSLS - user connected');

//        socket.on('user:joined', function(user) {
//            var message = user.name + ' joined the room';
//            console.log("user:join" + user);
//            //io.emit('user:joined', {message: message, time: moment(), expires: moment().add(10) })
//        })

        socket.on('user:disconnect', function(userFacebook){
            console.log(userFacebook.last_name);

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
                        eventEmitter.emit('user:joined', user);
                        return true
                    });

                } else {

                }
            });

        });

        socket.on('disconnect', function(message){
            console.log('RPSLS - user disconnected' + message);

            io.emit('user:list');
        });

        socket.on('message:send', function(message){
            console.log('message: ' + message);
            console.log(JSON.stringify(message));
            // var messageKey = 'message:' + message.name;
            // console.log('Storing key: ' + messageKey);
            var messageObj = { message: message.message, name: message.name, time: moment(), expires: moment().add('m', 2).unix() };

            console.log('storing to set: messages:' + message.channel);

            //Relay the message out to all who are listening.
            io.emit('message:channel:' + message.channel, messageObj);
            console.log('emited: ' + messageObj);
        });

        socket.on('channel:join', function(channelInfo) {
            console.log('Channel joined - ', channelInfo.channel);
            console.log(channelInfo);
            redisClient.zadd('channels', 100, channelInfo.channel, redis.print);
            console.log('Added to channels: ', channelInfo.channel);
            //redisClient.zadd('users:' + channelInfo.channel, 100, channelInfo.name, redis.print);
            // redisClient.zadd('messages:' + channelInfo.channel, 100, channelInfo.channel, redis.print);
            console.log('messages:' + channelInfo.channel);

            // socket.emit('messages:channel:' + channelInfo.channel, )

            //Add to watch to remove list.
            // for(var i = 0, j = channelWatchList.length; i < j; i++) {
            //   if()
            // }
            if(channelWatchList.indexOf(channelInfo.channel) == -1) {
                channelWatchList.push(channelInfo.channel);
            }

            socket.emit('channels', channelWatchList);


            //Emit back any messages that havent expired yet.
            getMessages(channelInfo.channel).then(function(data){
                console.log('got messages');
                // console.log(data);
                socket.emit('messages:channel:' + channelInfo.channel, data);
            });
        })

        sendInvitation();

        function sendInvitation() {
            socket.emit('invitation:send', { message: 'I challenge U', name: "david", channel: "channel 1" });
        }

        function userListUpdated() {
            socket.emit('user:list');
        }

        socket.on('invitation:accepted', function(user) {
            var message = user.playerId + ' joined the room';
            console.log(message);

            socket.on('player:move', function(user) {
                var message = user.playerMove + ' move';
                console.log(message);

                socket.emit('opponent:move', { opponentMove: 'lizard', channel: "channel 1" });
            });
        });
    });
}
