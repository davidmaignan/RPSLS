/**
 * Created by david on 2014-07-24.
 */
// load all the things we need
var FacebookStrategy = require('passport-facebook').Strategy,
    User             = require('../app/models/user'),
    configAuth       = require('./auth');

module.exports = function(passport) {

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    //Facebook login
    passport.use(new FacebookStrategy({
            clientID        : configAuth.facebookAuth.clientID,
            clientSecret    : configAuth.facebookAuth.clientSecret,
            callbackURL     : configAuth.facebookAuth.callbackURL
        },

        function(token, refreshToken, profile, done) {
            // asynchronous
            process.nextTick(function() {

                // find the user in the database based on their facebook id
                User.findOne({ 'facebook.id' : profile.id }, function(err, user) {

                    //an error connecting to the database
                    if (err)
                        return done(err);

                    if (user) {

                        //Update logging time and online status
                        user.facebook.online = true;
                        user.facebook.loggedin = new Date().getTime();

                        user.save(function(err) {
                            if (err)
                                throw err;

                            // if successful, return user
                            return done(null, newUser);
                        });

                    } else {

                        var newUser = new User();

                        // set all of the facebook information in our user model
                        newUser.facebook.id        = profile.id;
                        newUser.facebook.token     = token;
                        newUser.facebook.name      = profile.name.givenName + ' ' + profile.name.familyName;
                        newUser.facebook.email     = profile.emails[0].value;
                        newUser.facebook.online    = true;
                        newUser.facebook.createdAt = new Date().getTime();
                        newUser.facebook.loggedIn  = new Date().getTime();
                        newUser.facebook.test      = false;
                        newUser.win    = 0;
                        newUser.lost   = 0;

                        // save our user to the database
                        newUser.save(function(err) {
                            if (err)
                                throw err;

                            // if successful, return the new user
                            return done(null, newUser);
                        });
                    }
                });
            });
        }));
};