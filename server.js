var express = require('express');
var mongo = require('mongodb').MongoClient;
var app = express();
mongo.connect('mongodb://localhost:27017/clementinejs', function(err, db) {
	db.collection('list').remove();
	if(err) {
		throw err;
	} else {
		console.log('MongoDB successfully connected on port 27017.');
	}
	app.use('/shorten/:site(*)', function(req, res) {
		var projection = {
			'_id': false
		};
		var url = req.params.site;
		var list = db.collection('list');
		list.findOne({}, projection, function(err, result) {
			if(err) {
				throw err;
			} else {
				if(result) {
					console.log(result);
					res.send({
						normal: url,
						shortened: "https://urlshort-syncretistic.c9users.io/short/" + result.count
					});
					list.update(result, {
						$inc: {
							"count": 1
						},
						$push: {
							"urls": url
						}
					});
				} else {
					list.insert({
						urls: [url],
						count: 0
					}, function(err) {
						if(err) {
							console.log('Problem in Insertion');
						} else {
							list.findOne({}, projection, function(err, doc) {
								if(err) {
									throw err;
								} else {
									res.send({
										normal: doc.urls[doc.count],
										shortened: "https://urlshort-syncretistic.c9users.io/short/" + doc.count
									});
									list.update(doc, {
										$inc: {
											"count": 1
										}
									});
									console.log(doc);
								}
							})
						}
					});
				}
			}
		})
	});
	app.get('/check', function(req,res){
	  var list=db.collection('list');
	  list.findOne({},{'_id': false}, function(err, doc) {
	      if(err) throw err;
	      console.log(doc);
	  });
	});
	app.get('/short/:idsite', function(req, res) {
	    var idsite=req.params.idsite;
	    var list=db.collection('list');
	    list.findOne({},{'_id': false}, function(err, doc) {
	      if(err) throw err;
	      console.log(idsite);
	      console.log(doc.urls[idsite]);
	      res.redirect(doc.urls[idsite]);
	  });
	});
	app.get('/', function(req,res){
	  res.sendFile(process.cwd() + '/index.html');
	});
	app.listen(8080, function() {
		console.log('Listening on port 8080...');
	});
});