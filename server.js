var http = require('http')
var paperboy = require('./paperboy')

http.createServer(function(req, res) {
	var ip = req.connection.remoteAddress;
	paperboy
		.deliver(__dirname, req, res)
		.addHeader('Expires', 300)
		.addHeader('X-PaperRoute', 'Node')
		.error(function(statCode, msg) {
			res.writeHead(statCode, {
				'Content-Type': 'text/plain'
			});
			res.end("Error " + statCode);
		})
		.otherwise(function(err) {
			res.writeHead(404, {
				'Content-Type': 'text/plain'
			});
			res.end("Error 404: File not found");
		});
}).listen(3000);