const {
  flow,
} = require('lodash/fp');
const gutil = require('gulp-util');
const through = require('through2');
const escapeHTML = require('escape-html');

const fs = require('fs');

function readModuleFileSync(path) {
  const filename = require.resolve(path);
  return fs.readFileSync(filename, 'utf8');
}

function makeInjectedCSSScriptTag(contents, file) {
  const injectedCSSFile = {
    key: 'injected',
    name: file.relative,
    content: contents,
  };
  return `<script>var injectedCSSFile = ${
    JSON.stringify(injectedCSSFile)
  }</script>`;
}

const { PluginError } = gutil;

const PLUGIN_NAME = 'gulp-css-info';

module.exports = function cssInfo() {
  const htmlTemplate = readModuleFileSync('css-info-app/build/index.html');
  // const assets = require('css-info-app/build/asset-manifest.json');
  const injectCSSScriptTag = (
    file =>
    contents =>
    htmlTemplate.replace(/(?=<script)/, makeInjectedCSSScriptTag(contents, file))
  );
  const embedJS = (
    contents =>
    contents.replace(
      /(<script[^>]*?) src="(\/static\/js\/.*?\.js)"([^>]*?>)(<\/script>)/,
      (match, start1, src, start2, end) => (
        `${
          start1
        }${
          start2
        }${
          readModuleFileSync(`css-info-app/build${src}`)
        }${
          end
        }`
      )
    )
  );
  const embedCSS = (
    contents =>
    contents.replace(
      /(<link[^>]*?) href="(\/static\/css\/.*?\.css)"([^>]*?>)/,
      (match, start1, href) => (
        `<style>${
          readModuleFileSync(`css-info-app/build${href}`)
        }</style>`
      )
    )
  );
  return through.obj(function cssInfoTransform(file, encoding, callback) {
    if (file.isNull()) {
      // nothing to do
      return callback(null, file);
    }

    if (file.isStream()) {
      this.emit('error', new PluginError(PLUGIN_NAME, 'Streams not supported!'));
    } else if (file.isBuffer()) {
      // eslint-disable-next-line no-param-reassign
      file.contents = flow([
        contents => contents.toString(),
        injectCSSScriptTag(file),
        // value => (console.log(value), value),
        embedJS,
        embedCSS,
        contents => new Buffer(contents),
      ])(
        file.contents
      );
      // eslint-disable-next-line no-param-reassign
      file.path = gutil.replaceExtension(file.path, '.html');
      return callback(null, file);
    }
    return undefined;
  });
};
