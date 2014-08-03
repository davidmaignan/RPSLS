//API
module.exports = function(app) {


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
        if ('OPTIONS' == req.method) {
            res.send(200);
        }
        else {
            res.json(playerList);
        }


    });


}
