# CSS info for Gulp

This gulp plugin allows you to generate a static version of the [CSS info app](https://github.com/jeanfredrik/css-info-app) contained within a single file. The generated HTML file is a replacement for [css-info.com](http://css-info.com/) so that you can include your functional CSS reference in your project repo.

## Example usage

Import as `cssInfo` and pipe CSS files through `cssInfo()`. They will be converted to HTML files.

```js
import gulp from 'gulp';
import cssInfo from 'gulp-css-info';

// Turns `css/style.css` into `docs/css/style.html`
gulp.task('default', () =>
  gulp.src('**/*.css')
    .pipe(cssInfo())
    .pipe(gulp.dest('docs'))
)

```
