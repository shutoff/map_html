var fs = require('fs')
var path = require('path')
var child_process = require('child_process')

var args = [];

var add_files = function(dir){
	var files = fs.readdirSync(dir);
	files.sort();
	for (var i in files){
		var f = path.resolve(dir, files[i]);
		var stat = fs.statSync(f);
		if (stat.isDirectory())
			add_files(f);
	}
	for (var i in files){
		if (path.extname(files[i]) != '.js')
			continue;
		args.push(path.resolve(dir, files[i]));
	}
}

args.push(path.resolve(__dirname, 'leaflet-src.js'))
add_files(path.resolve(__dirname, 'js'))

args.push('-o')
args.push(path.resolve(__dirname, '../ugona.net/src/main/assets/leaflet.min.js'))
args.push('--screw-ie8')
args.push('--compress')

console.log(args)

child_process.fork(path.resolve(__dirname, 'node_modules/uglify-js/bin/uglifyjs'), args)
	.on('exit', function(code){
		console.log('done', code)
		process.exit()
	})