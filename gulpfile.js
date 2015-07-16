'use strict';
var gulp = require('gulp');
var jshint = require('gulp-jshint');
var notify = require('gulp-notify');
var bower = require('gulp-bower');

gulp.task('jshint', function() {
  gulp.src('js/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .on('error', notify.onError(function (error) {
      return error.message;
    }));
});

gulp.task('bower', function() {
  return bower().pipe(gulp.dest('lib'));
});

gulp.task('watch', function() {
  gulp.watch('js/**/*.js', ['jshint']);
});

gulp.task('default', ['build'], function () {
  gulp.start('watch');
});

gulp.task('build', ['bower', 'jshint']);