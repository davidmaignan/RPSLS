
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
	reload     = require('reload'),
    events     = require('events');

var passport     = require('passport');
var flash        = require('connect-flash');
var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');
var mongoose     = require('mongoose');
var eventEmitter = new events.EventEmitter();

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
require('./app/api.js')(app, mongoose, eventEmitter); // pass passport for configuration


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


//GameManager
//require('./app/gameManager')(io, eventEmitter, mongoose);

//Routes game
app.get('/leaderboard', game.leaderboard());

var User = require('./app/models/user')

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
        //console.log("addPlayerHand : ", gameList.length);
        var game;
        for (game in gameList) {
            //console.log(gameList[game].id);
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
        io.sockets.emit('client:invitation', game);;
    });

    socket.on('server:accepted', function(game){
        io.sockets.emit('client:accepted', game);
        gameManager.addGame(game);
    });

    socket.on('server:rejected', function(game){
        io.sockets.emit('client:rejected', game);
    });

    socket.on('server:playerHand', function(playerHand) {
        console.log("playerHand", playerHand);
        var game = gameManager.addPlayerHand(playerHand);

        if(game !== false) {
            io.sockets.emit('client:result', game);
        }
    })
});
