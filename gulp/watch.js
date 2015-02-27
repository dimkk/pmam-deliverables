'use strict';

var gulp = require('gulp');

var config = gulp.config;

gulp.task('watch', ['inject'], function () {
  gulp.watch([
    config.src + '*.html',
    config.src + '{common,modules}/**/*.less',
    config.src + '{common,modules}/**/*.js',
    'bower.json'
  ], ['inject']);
});
