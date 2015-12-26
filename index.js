var through = require('through2');
var cssInfo = require('css-info');
var gutil = require('gulp-util');

module.exports = function() {
	return through.obj(function(file, encoding, callback) {
		if(file.isNull()) {
			// nothing to do
			return callback(null, file);
		}

		if(file.isStream()) {
			this.emit('error', new PluginError(PLUGIN_NAME, 'Streams not supported!'));
		} else if(file.isBuffer()) {
			file.contents = JSON.stringify(cssInfo.parse(file.contents.toString()), null, '\t');
			file.path = gutil.replaceExtension(file.path, '.json');
			return callback(null, file);
		}
	});
};
