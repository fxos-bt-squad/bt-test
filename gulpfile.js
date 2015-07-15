'use strict';
var gulp = require('gulp');
var jshint = require('gulp-jshint');
var notify = require('gulp-notify');

gulp.task('jshint', function() {
  gulp.src('js/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .on('error', notify.onError(function (error) {
      return error.message;
    }));
});

gulp.task('watch', function() {
  gulp.watch('js/**/*.js', ['jshint']);
});

gulp.task('default', ['jshint'], function () {
  gulp.start('watch');
});
