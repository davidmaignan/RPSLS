exports.show = function(db) {
	
	return function(req, res){
		
		var sessionList = db.get('sessions');
		sessionList.find({ name: 'Tobi' }, {}, function(e, docs){
			
			console.log(docs);
			res.render('session/index', {
				"sessionList": docs
			})
		})	
	};
};

exports.index = function(db) {
	return function(req, res) {
		
        var collection = db.get('sessions');
		
		collection.insert({ name: 'Tobi', bigdata: {} });
		
        //collection.find({},{},function(e,docs){
            res.render('session/index', {
                "title" : "Hello session"
            });
			//});
		       
	};
};

exports.userlist = function(db) {
    return function(req, res) {
        var collection = db.get('usercollection');
        collection.find({},{},function(e,docs){
            res.render('userlist', {
                "userlist" : docs
            });
        });
    };
};