
/**
 * Module dependencies.
 */

var express    = require('express'),
	routes     = require('./routes'),
	user       = require('./routes/user'),
	chat       = require('./routes/chat'),
	session    = require('./routes/session'),
	cookie     = require('./routes/cookie'),
    game       = require('./routes/game'),
	http       = require('http'),
	path       = require('path'),
	mongo      = require('mongodb'),
	monk       = require('monk'),
	db         = monk('localhost:27017/nodetest1'),
	app        = express(),
	reload     = require('reload');

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
app.get('/session/index', session.index(db));
app.get('/session/show', session.show(db));

//Routes user
app.get('/users', user.list);
app.get('/user/list', user.userlist(db));
app.get('/user/new', user.newuser);
app.post('/user/add', user.adduser(db));



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
