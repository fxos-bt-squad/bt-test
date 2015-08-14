'use strict';
var gulp = require('gulp');
var jshint = require('gulp-jshint');
var notify = require('gulp-notify');
var gulpUtil = require('gulp-util');
var bower = require('gulp-bower');
var jscs = require('gulp-jscs');
var browserSync = require('browser-sync');
var sourcemaps = require('gulp-sourcemaps');
var concat = require('gulp-concat');
var del = require('del');
var shell = require('gulp-shell');
var runSequence = require('run-sequence');
var fs = require('fs');
var path = require('path');

var JS_FILE_PATH = ['js/**/*.js', 'test/**/*.js'];
var TEST_FILE_PATH = ['test/**/*.js'];
var TEST_DEPENDENCY = [
  'test/runner.html',
  'node_modules/should/should.min.js',
  'node_modules/sinon/pkg/sinon.js',
  'node_modules/mocha/mocha.js',
  'node_modules/mocha/mocha.css',
  'lib/**/*.js'
];

gulp.task('clean', del.bind(null, ['.tmp', 'bower_components', 'lib']));

gulp.task('clean-dev', del.bind(null,
  ['bower_components/bluetooth_manager', 'lib/bluetooth_manager']));

gulp.task('bower', function() {
  return bower().pipe(gulp.dest('lib'));
});

gulp.task('jshint', function() {
  return gulp.src(JS_FILE_PATH)
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .on('error', notify.onError(function (error) {
      return error.message;
    }));
});

gulp.task('jscs', function() {
  return gulp.src(JS_FILE_PATH).pipe(jscs());
});

gulp.task('watch', function() {
  gulp.watch(JS_FILE_PATH, ['jshint', 'jscs']);
});

gulp.task('docs', ['clean-docs'], function() {
  gulp.src(['README.md', 'js/**/*.js'], {read: false}).pipe(
    shell(['./node_modules/.bin/jsdoc -c ./jsdoc.json -d ./docs -r']));
});

gulp.task('clean-docs', del.bind(null, ['docs']));

// TODO: we might need a 'clean-build' command
gulp.task('build', function(callback) {
  runSequence('bower', ['docs', 'jshint', 'jscs'], callback);
});

gulp.task('build-dev', function(callback) {
  runSequence('clean-dev', 'build', callback);
});

gulp.task('dependency-for-test', function() {
  return gulp.src(TEST_DEPENDENCY)
    .pipe(gulp.dest('.tmp'));
});

gulp.task('prepare-for-test', ['build', 'dependency-for-test'], function() {
  var jsFiles = fs.readdirSync('js');
  var filesToBundle = [];

  jsFiles.forEach(function(jsFile) {
    var parsedName = path.parse(jsFile);
    var jsFilePath = 'js/' + jsFile;
    var testFilePath = 'test/' + parsedName.name + '_test.js';
    if (fs.existsSync(testFilePath)) {
      filesToBundle.push(jsFilePath);
      filesToBundle.push(testFilePath);
    }
  });

  return gulp.src(filesToBundle)
    .pipe(sourcemaps.init())
    .pipe(concat('test.js'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('.tmp'));
});

gulp.task('test', ['prepare-for-test'], function() {
  browserSync.init({
    server: {
      baseDir: '.tmp',
      index: 'runner.html'
    }
  });

  gulp.watch(['.tmp/**/*']).on('change', browserSync.reload);
  gulp.watch(JS_FILE_PATH, ['prepare-for-test']);
});

gulp.task('default', ['test']);
