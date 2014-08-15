/**
 * Created by davidm on 2014-07-24.
 */
// app/routes.js
module.exports = function(app, passport) {

    app.get('/', function(req, res) {
        res.render('index'); // load the index.ejs file
    });


    app.get('/profile', isLoggedIn, function(req, res) {
        res.render('profile', {
            user : req.user // get the user out of session and pass to template
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

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated
    if (req.isAuthenticated())
        return next();

    // redirection
    res.redirect('/');
}
