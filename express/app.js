
/**
 * Module dependencies.
 */

var express    = require('express'),
	routes     = require('./routes'),
	user       = require('./routes/user'),
	chat       = require('./routes/chat'),
	//session    = require('./routes/session'),
	cookie     = require('./routes/cookie'),
    game       = require('./routes/game'),
	http       = require('http'),
	path       = require('path'),
	//mongo      = require('mongodb'),
	monk       = require('monk'),
	//db         = monk('localhost:27017/nodetest1'),
	app        = express(),
	reload     = require('reload');

var passport     = require('passport');
var flash        = require('connect-flash');
var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');
var mongoose     = require('mongoose');

//Config database
var configDB = require('./config/database.js');
mongoose.connect(configDB.url);

app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser()); // get information from html forms

//Passport
app.use(session({ secret: 'ilovescotchscotchyscotchscotch' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session


// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

//Session
app.use(express.cookieParser());


// Synchronous Function
var auth = express.basicAuth(function(user, pass) {
 return user === 'user' && pass === 'userpass';
});

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//Routes
app.get('/', routes.index);
app.get('/helloworld', auth, routes.helloworld);

//Routes session
//app.get('/session/index', session.index(db));
//app.get('/session/show', session.show(db));

//Routes user
//app.get('/users', user.list);
//app.get('/user/list', user.userlist(db));
//app.get('/user/new', user.newuser);
//app.post('/user/add', user.adduser(db));

// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport
require('./config/passport')(passport); // pass passport for configuration
require('./app/api.js')(app, mongoose); // pass passport for configuration



//Cookie
app.get('/cookie/:user', function(req, res){
	res.cookie('username', req.params.user)
	    .send('<p>Cookie Set: <a href="/cookie">View Here</a>');
});

app.get('/cookie', function(req, res){
	res.end(JSON.stringify(req.headers.cookie));
});


var server = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

reload(server, app);

//Chat
var io = require('socket.io').listen(server);
app.get('/chat', chat.index(io));

//Routes game
app.get('/game', game.index(io));


io.on('connection', function(socket){
    console.log('RedisChat - user connected');

    socket.on('disconnect', function(){
        console.log('RedisChat - user disconnected');
    });

    socket.on('user:joined', function(user) {
        var message = user.name + ' joined the room';
        io.emit('user:joined', {message: message, time: moment(), expires: moment().add(10) })
    })

    socket.on('message:send', function(message){
        console.log('message: ' + message);
        console.log(JSON.stringify(message));
        // var messageKey = 'message:' + message.name;
        // console.log('Storing key: ' + messageKey);
        var messageObj = { message: message.message, name: message.name, time: moment(), expires: moment().add('m', 2).unix() };
        // console.log('this: ' + JSON.stringify(messageObj));
        // redisClient.set(messageKey, JSON.stringify(messageObj), redis.print);
        // redisClient.expire(messageKey, 600);

        console.log('storing to set: messages:' + message.channel);

        //redisClient.zadd('messages:' +  message.channel, moment().add('m', 2).unix(), JSON.stringify(messageObj));

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

    function sendInvitation()
    {
        socket.emit('invitation:send', { message: 'I challenge U', name: "david", channel: "channel 1" });
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