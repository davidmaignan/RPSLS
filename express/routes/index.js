
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'IChallengeU' });
};

exports.helloworld = function(req, res) {
	res.render('helloworld', {
		'title': "Hello world",
	});
};