
/**
 * Module dependencies.
 */

var express    = require('express'),
	routes     = require('./routes'),
	user       = require('./routes/user'),
	cookie     = require('./routes/cookie'),
    game       = require('./routes/game'),
	http       = require('http'),
	path       = require('path'),
	monk       = require('monk'),
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
app.use(session({ secret: 'heymonamiaimetucalespatates'})); // session secret
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

// routes ======================================================================
require('./app/routes.js')(app, passport);
require('./config/passport')(passport);
require('./app/api.js')(app, mongoose);

var server = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

reload(server, app);

//IO
var io = require('socket.io').listen(server);

//Routes game
//app.get('/game', game.index(io));

//GameManager
require('./app/gameManager')(io);

//Routes game
app.get('/leaderboard', game.leaderboard());
