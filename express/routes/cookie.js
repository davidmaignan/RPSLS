exports.index = function(req, res){
	res.cookie('username', req.params.param)
	    .send('<p>Cookie Set: <a href="/cookie">View Here</a>');
};

exports.view = function(req, res) {
	console.log("fuck you");
	res.send(req.cookies.username);
}