var gulp = require('gulp-help')(require('gulp'));
var zip = require('gulp-zip');
var gutil = require('gulp-util');
var rimraf = require('rimraf');
var path = require('path');
var extensionPath = path.resolve(__dirname, 'extension');
var browserify = require('browserify');
var transform = require('vinyl-transform');

gulp.task('default', ['build']);
gulp.task('build', 'Rebuild the extension files', ['extension-assets', 'extension-browserify']);

gulp.task('extension-browserify', 'Browserify the extension files', ['prepare'], function() {
  var browserified = transform(function(filename) {
    var b = browserify(filename);
    return b.bundle();
  });

  return gulp.src([
    './extension/src/index.js'
  ])
  .pipe(browserified)
  .pipe(gulp.dest('./extension/dist'));
});

gulp.task('extension-assets', 'Copy the extension source assets into the dist folder', ['prepare', 'chromex-assets'], function() {
  return gulp.src([
    './extension/src/*.png',
    './extension/src/*.svg',
    './extension/src/*.json'
  ])
  .pipe(gulp.dest('./extension/dist'));
});

gulp.task('chromex-assets', 'Assets required for the chromex code to work as expected', ['prepare'], function() {
  return gulp.src([
    './node_modules/chromex/scripts/*.js'
  ])
  .pipe(gulp.dest('./extension/dist/scripts'));
});

gulp.task('prepare', 'Prepare the build', ['clean'], function() {
});

gulp.task('clean', 'Clean the extension dist directory', function(cb) {
  rimraf(path.join(extensionPath, 'dist'), cb);
});


/*
gulp.task('serve', 'Serve the local files using a development server', function(cb) {
  var mount = st({
    path: process.cwd(),
    index: 'index.html',
    cache: false
  });

  http.createServer(mount).listen(port, function(err) {
    if (! err) {
      gutil.log('server running @ http://localhost:' + port + '/');
    }

    cb(err);
  });
});

gulp.task('package', 'Package for upload to build.rtc.io', function() {
  return gulp.src([
    './*',
    '!*.zip',
    'vendor/*',
    '!vendor/*.zip',
    'css/*',
    '!css/*.zip',
    'icons/*',
    '!icons/*.zip',
    '!gulpfile.js',
    '!package.json'
  ], { base: '.' })
  .pipe(zip('archive.zip'))
  .pipe(gulp.dest('.//'));
});

gulp.task('vendor', 'Rebuild vendor scripts from node package dependencies', [
  'vendor-rtc',
  'plugin-ios',
  'plugin-temasys'
]);

gulp.task('vendor-rtc', function() {
  return gulp
    .src('node_modules/rtc/dist/*')
    .pipe(gulp.dest('vendor/'));
});

gulp.task('plugin-ios', function() {
  return gulp
    .src('node_modules/rtc-plugin-nicta-ios/dist/*')
    .pipe(gulp.dest('vendor/'));
});

gulp.task('plugin-temasys', function() {
  return gulp
    .src('node_modules/rtc-plugin-temasys/dist/*')
    .pipe(gulp.dest('vendor/'));
});
*/
