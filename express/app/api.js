//API
var User = require('../app/models/user');

module.exports = function(app, mongoose, eventEmitter) {

    var mongoose = mongoose;

    var allowCrossDomain = function(req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        // intercept OPTIONS method
        if ('GET' == req.method || 'POST' == req.method) {
            res.send(200);
        }
        else {
            next();
        }
    };

    app.use(allowCrossDomain);


    app.get('/api', function(req, res) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        // intercept OPTIONS method
        if ('OPTIONS' == req.method) {
            res.send(200);
        }
        else {
            res.send(500);
        }
    });

    app.get('/api/players', function(req, res) {

        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        //"facebook.id" : { $ne: req.params.userId

        var playerCollection = User.find({ "facebook.online": true} , function(err, collection) {
            if (err) {
                res.send(500)
            }

            //console.log(collection);

            res.json(collection);
        });

    });

    app.post('/api/players', function(req, res) {

        User.findOne({ 'facebook.id' :req.query.id }, function(err, user) {

            //an error connecting to the database
            if (err)
                return done(err);

            if (user) {

                //Update logging time and online status
                user.facebook.online = true;
                user.facebook.loggedin = new Date().getTime();

                user.save(function (err) {
                    if (err) {
                        console.log("user not save");
                        return false
                    }

                    // if successful, return user
                    return true
                });

            } else {
                var newUser = new User();

                // set all of the facebook information in our user model
                newUser.facebook.id        = req.query.id;
                newUser.facebook.token     = req.query.token;
                newUser.facebook.name      = req.query.firstName + ' ' + req.query.lastName;
                newUser.facebook.email     = req.query.email;
                newUser.facebook.online    = true;
                newUser.facebook.createdAt = new Date().getTime();
                newUser.facebook.loggedIn  = new Date().getTime();
                newUser.win                = req.query.win;
                newUser.lose               = req.query.lose;

                newUser.save(function(err) {
                    if (err) {
                        console.log("user not save");
                        return false
                    }

                    console.log("user save");
                    //eventEmitter.emit('user:joined', newUser);
                    return true
                });
            }
        });

        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        // intercept OPTIONS method
        if ('POST' == req.method) {
            res.send(200);
        }
        else {
            res.send(500);
        }
    });
}
