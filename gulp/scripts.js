'use strict';

var gulp = require('gulp');

var config = gulp.config;

var $ = require('gulp-load-plugins')();

gulp.task('scripts', function () {
  return gulp.src(config.src + '{common,modules}/**/*.js')
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.babel())
    .on('error', function handleError(err) {
      console.error(err.toString());
      this.emit('end');
    })
    .pipe(gulp.dest(config.tmp + 'babel'))
    .pipe($.size())
});

gulp.task('browserify', ['scripts'], function () {
  return gulp.src(config.tmp + 'babel/common/index.js', { read: false })
    .pipe($.browserify())
    .on('error', function handleError(err) {
      console.error(err.toString());
      this.emit('end');
    })
    .pipe(gulp.dest(config.tmp + 'serve/common'))
    .pipe($.size());
});
