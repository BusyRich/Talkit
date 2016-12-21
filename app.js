var static = require('node-static'),
		file = new static.Server('./public') //Creates a static file server from the ./public folder
		port = 5000;

var server = require('http').createServer(function (request, response) {
    request.addListener('end', function () {
        //
        // Serve files!
        //
        file.serve(request, response);
    }).resume();
}).listen(port, function() {
	console.log('Server Started on port %s', port);
});
