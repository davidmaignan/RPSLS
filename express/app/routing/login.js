/**
 * Created by david on 2014-08-01.
 */
// app/routes.js
module.exports = function(app, passport) {

    app.get('/', function(req, res) {
        res.render('index');
    });


    app.get('/profile', isLoggedIn, function(req, res) {
        res.render('profile', {
            user : req.user
        });
    });

    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    // Facebook
    app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));

    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect : '/profile',
            failureRedirect : '/'
        }));
};


function isLoggedIn(req, res, next) {

    // if user is authenticated
    if (req.isAuthenticated())
        return next();

    // redirection
    res.redirect('/');
}
