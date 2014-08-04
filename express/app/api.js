//API
var User = require('../app/models/user');

module.exports = function(app, mongoose) {

    var mongoose = mongoose;

    var allowCrossDomain = function(req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        // intercept OPTIONS method
        if ('OPTIONS' == req.method) {
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
            next();
        }

        res.json({ message: 'Welcome to RPSLS api!' });
    });

    app.get('/api/players', function(req, res) {

        var playerList = [
            { "id" : "53dbcf635df946aa30d29ae7", "facebook" : { "email" : "davidmaignan@gmail.com", "name" : "David Maignan", "token" : "CAAB6HUWTsJoBAKX0rIbBtjuz6jyZCy9NUbNmeM7G2PFmuEjHe3r6D89ugLYqyUSIoZC64RfyzcVZBweofMSP7zRZAU8trMTyM4A3fAL0MLf7La4TqdPVyK4a6FYZB2WQutzqS71ZBax8QukYjgh0z2omD4BrvZArffCLXMwAiRfaJXvKDZB1mLmT7WOlCtIpZAR1wsyCmlDXVWsAvGzso6R4B", "id" : "1160449371" }, "__v" : 0 },
            { "id" : "53dbcf635df946aa30d29ae7", "facebook" : { "email" : "davidmaignan@gmail.com", "name" : "David Maignan", "token" : "CAAB6HUWTsJoBAKX0rIbBtjuz6jyZCy9NUbNmeM7G2PFmuEjHe3r6D89ugLYqyUSIoZC64RfyzcVZBweofMSP7zRZAU8trMTyM4A3fAL0MLf7La4TqdPVyK4a6FYZB2WQutzqS71ZBax8QukYjgh0z2omD4BrvZArffCLXMwAiRfaJXvKDZB1mLmT7WOlCtIpZAR1wsyCmlDXVWsAvGzso6R4B", "id" : "1160449371" }, "__v" : 0 },
            { "id" : "53dbcf635df946aa30d29ae7", "facebook" : { "email" : "davidmaignan@gmail.com", "name" : "David Maignan", "token" : "CAAB6HUWTsJoBAKX0rIbBtjuz6jyZCy9NUbNmeM7G2PFmuEjHe3r6D89ugLYqyUSIoZC64RfyzcVZBweofMSP7zRZAU8trMTyM4A3fAL0MLf7La4TqdPVyK4a6FYZB2WQutzqS71ZBax8QukYjgh0z2omD4BrvZArffCLXMwAiRfaJXvKDZB1mLmT7WOlCtIpZAR1wsyCmlDXVWsAvGzso6R4B", "id" : "1160449371" }, "__v" : 0 },
            { "id" : "53dbcf635df946aa30d29ae7", "facebook" : { "email" : "davidmaignan@gmail.com", "name" : "David Maignan", "token" : "CAAB6HUWTsJoBAKX0rIbBtjuz6jyZCy9NUbNmeM7G2PFmuEjHe3r6D89ugLYqyUSIoZC64RfyzcVZBweofMSP7zRZAU8trMTyM4A3fAL0MLf7La4TqdPVyK4a6FYZB2WQutzqS71ZBax8QukYjgh0z2omD4BrvZArffCLXMwAiRfaJXvKDZB1mLmT7WOlCtIpZAR1wsyCmlDXVWsAvGzso6R4B", "id" : "1160449371" }, "__v" : 0 }
        ];

        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        // intercept OPTIONS method
        if ('GET' == req.method) {
            res.json(playerList);
        }
        else {
            res.send(500)
        }
    });

    app.post('/api/players', function(req, res) {

        console.log(req.body);

        var newUser = new User();
//
        // set all of the facebook information in our user model
        newUser.facebook.id        = req.query.id;
        newUser.facebook.token     = req.query.token;
        newUser.facebook.firstName = req.query.firstName + ' ' + req.query.familyName;
        newUser.facebook.lastName  =
        newUser.facebook.email     = req.query.email;
        newUser.facebook.online    = true;
        newUser.facebook.createdAt = new Date().getTime();
        newUser.facebook.loggedIn  = new Date().getTime();
        newUser.win                = 0;
        newUser.lose               = 0;

        var saveUser = newUser.save(function(err) {
            if (err)
                return false

            // if successful, return the new user
            return true
        });

        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        // intercept OPTIONS method
        if ('POST' == req.method) {
            res.send(200);
        }
        else {
            res.json({ message: 'Welcome to RPSLS api!' });
        }
    });


}
