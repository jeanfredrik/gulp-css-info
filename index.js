var _ = require('lodash');
var through = require('through2');
var cssInfo = require('css-info');
var gutil = require('gulp-util');
var fs = require('fs');
var jade = require('jade');
var jadeFile;

var PLUGIN_NAME = 'gulp-css-info';
var JADE_FILE = __dirname+'/templates/css-info-page.jade';

module.exports = function(options) {
	options = options || {};
	return through.obj(function(file, encoding, callback) {
		if(file.isNull()) {
			// nothing to do
			return callback(null, file);
		}

		if(file.isStream()) {
			this.emit('error', new PluginError(PLUGIN_NAME, 'Streams not supported!'));
		} else if(file.isBuffer()) {
			file.contents = new Buffer(JSON.stringify(cssInfo.parse(file.contents.toString()), null, options.indent));
			file.path = gutil.replaceExtension(file.path, '.json');
			return callback(null, file);
		}
	});
};

function propertiesStringMatcher(propertiesString) {
	return function(item) {
		return item.classes[0].propertiesString === propertiesString;
	};
}

function forEachBorderItem(item) {
	item.containsBorderColorProperty = item.classes[0].properties.some(function(property) {
		return /^border-(top|right|bottom|left)-color$/.test(property);
	});
	item.containsBorderStyleProperty = item.classes[0].properties.some(function(property) {
		return /^border-(top|right|bottom|left)-style$/.test(property);
	});
	item.containsBorderWidthProperty = item.classes[0].properties.some(function(property) {
		return /^border-(top|right|bottom|left)-width$/.test(property);
	});
}

module.exports.html = function(options) {
	options = options || {};
	return through.obj(function(file, encoding, callback) {
		if(file.isNull()) {
			// nothing to do
			return callback(null, file);
		}

		if(file.isStream()) {
			this.emit('error', new PluginError(PLUGIN_NAME, 'Streams not supported!'));
		} else if(file.isBuffer()) {

			var css = file.contents.toString();

			var info = cssInfo.parse(css, {

			});

			jadeFile = jadeFile || jade.compileFile(JADE_FILE);

			var classGroups = _.groupBy(info.classes, 'declarationsString');

			items = _.map(classGroups, function(classGroup, id) {
				return {
					id: id,
					classes: classGroup,
				};
			});

			var categories = _.map({
				'color': 'Text color',
				'background-color': 'Background color',
				'text-shadow': 'Text shadow',
				'box-shadow': 'Box shadow',
				'border-bottom-color,border-left-color,border-right-color,border-top-color': 'Border color all sides',
				'border-bottom-style,border-left-style,border-right-style,border-top-style': 'Border style all sides',
				'border-bottom-width,border-left-width,border-right-width,border-top-width': 'Border width all sides',
			}, function(title, name) {
				return {
					name: name,
					type: name.replace(/-(top|right|bottom|left).*$/, ''),
					title: title,
					filter: propertiesStringMatcher(name),
					forEachItem: forEachBorderItem,
				};
			}).concat([
				{
					name: 'border-top',
					title: 'Border top',
					type: 'border',
					filter: function(item) {
						return item.classes[0].properties.every(function(property) {
							return /^border-(top)-(color|style|width)$/.test(property);
						});
					},
					forEachItem: forEachBorderItem,
				},
				{
					name: 'border-right',
					title: 'Border right',
					type: 'border',
					filter: function(item) {
						return item.classes[0].properties.every(function(property) {
							return /^border-(right)-(color|style|width)$/.test(property);
						});
					},
					forEachItem: forEachBorderItem,
				},
				{
					name: 'border-bottom',
					title: 'Border bottom',
					type: 'border',
					filter: function(item) {
						return item.classes[0].properties.every(function(property) {
							return /^border-(bottom)-(color|style|width)$/.test(property);
						});
					},
					forEachItem: forEachBorderItem,
				},
				{
					name: 'border-left',
					title: 'Border left',
					type: 'border',
					filter: function(item) {
						return item.classes[0].properties.every(function(property) {
							return /^border-(left)-(color|style|width)$/.test(property);
						});
					},
					forEachItem: forEachBorderItem,
				},
				{
					name: 'border-bottom,border-top',
					title: 'Border vertical',
					type: 'border',
					filter: function(item) {
						return item.classes[0].properties.every(function(property) {
							return /^border-(top|bottom)-(color|style|width)$/.test(property);
						});
					},
					forEachItem: forEachBorderItem,
				},
				{
					name: 'border-left,border-right',
					title: 'Border horizontal',
					type: 'border',
					filter: function(item) {
						return item.classes[0].properties.every(function(property) {
							return /^border-(right|left)-(color|style|width)$/.test(property);
						});
					},
					forEachItem: forEachBorderItem,
				},
				{
					name: 'border',
					title: 'Border all sides',
					type: 'border',
					filter: function(item) {
						return item.classes[0].properties.every(function(property) {
							return /^border-(top|right|bottom|left)-(color|style|width)$/.test(property);
						});
					},
					forEachItem: forEachBorderItem,
				},
			],
			_.map({
				'font-family': 'Font family',
				'font-weight': 'Font weight',
				'font-size': 'Font size',
				'line-height': 'Line height',
				'text-transform': 'Text transform',
				'text-decoration': 'Text decoration',
				'text-align': 'Text align',
				'margin-top': 'Margin top',
				'margin-right': 'Margin right',
				'margin-bottom': 'Margin bottom',
				'margin-left': 'Margin left',
				'margin-bottom,margin-top': 'Margin vertical',
				'margin-left,margin-right': 'Margin horizontal',
				'margin': 'Margin all sides',
				'padding-top': 'Padding top',
				'padding-right': 'Padding right',
				'padding-bottom': 'Padding bottom',
				'padding-left': 'Padding left',
				'padding-bottom,padding-top': 'Padding vertical',
				'padding-left,padding-right': 'Padding horizontal',
				'padding': 'Padding all sides',
				'width': 'Width',
				'min-width': 'Min width',
				'max-width': 'Max width',
				'height': 'Height',
				'min-height': 'Min height',
				'max-height': 'Max height',
				'display': 'Display',
				'float': 'Float',
				'position': 'Position',
				'top': 'Top',
				'right': 'Right',
				'bottom': 'Bottom',
				'left': 'Left',
			}, function(title, name) {
				return {
					name: name,
					type: name.replace(/-(top|right|bottom|left).*$/, '').replace(/^(min|max)-/, ''),
					title: title,
					filter: propertiesStringMatcher(name),
				};
			}),
			[
				{
					name: 'overflow',
					title: 'Overflow',
					type: 'overflow',
					filter: function(item) {
						return item.classes[0].properties.every(function(property) {
							return /^overflow(-(x|y))?$/.test(property);
						});
					},
				},
				{
					name: 'border-radius',
					title: 'Border radius',
					type: 'border-radius',
					filter: function(item) {
						return item.classes[0].properties.every(function(property) {
							return /^border(-(top|bottom)-(right|left))?-radius$/.test(property);
						});
					},
				},
				{
					name: 'none',
					title: 'Other classes',
					type: 'none',
				},
			]);

			var uncategorizedItems = items;

			categories.forEach(function(category) {
				if(category.filter) {
					var partitions = _.partition(uncategorizedItems, category.filter);
					category.items = partitions[0];
					uncategorizedItems = partitions[1];
				} else {
					category.items = uncategorizedItems;
					uncategorizedItems = [];
				}
				category.items.forEach(function(item) {
					item.category = category.name;
					item.type = category.type;
				});
				if(category.forEachItem) {
					category.items.forEach(category.forEachItem);
				}
				delete category.forEachItem;
				delete category.filter;
			});

			var states = _.uniq(_.flatten(_.map(info.classes, 'states'), true));
			var medias = _.uniq(_.flatten(_.map(info.classes, 'medias'), true));

			var data = jadeFile({
				css: css,
				categories: categories,
				states: states,
				medias: medias,
				exampleBgValues: [
					{
						label: 'White',
						css: {
							'bg': "white",
							'border-color': "black",
							'fg': "white",
						},
					},
					{
						label: 'Checkboard',
						css: {
							'bg': "top left url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAACpJREFUeNpi/P//PwM2cPbsWaziTAwkglENxAAWXOFtbGw8Gkr00wAQYAD5xAiGkcIskQAAAABJRU5ErkJggg==)",
							'border-color': "black",
							'fg': "transparent",
						},
					},
					{
						label: 'Black',
						css: {
							'bg': "black",
							'border-color': "white",
							'fg': "black",
						},
					},
				]
			});

			file.contents = new Buffer(data);
			file.path = gutil.replaceExtension(file.path, '.html');
			return callback(null, file);
		}
	});
};
