'use strict';

var gulp = require('gulp');

var config = gulp.config;

var $ = require('gulp-load-plugins')();

var wiredep = require('wiredep').stream;

gulp.task('inject', ['styles', 'browserify'], function () {

  var injectStyles = gulp.src([
    config.tmp + 'serve/{common,modules}/**/*.css',
    '!' + config.tmp + 'serve/common/vendor.css'
  ], { read: false });

  var injectScripts = gulp.src([
    config.tmp + 'serve/{common,modules}/**/*.js',
    '!' + config.src + '{common,modules}/**/*.spec.js',
    '!' + config.src + '{common,modules}/**/*.mock.js'
  ], { read: false });

  var injectOptions = {
    ignorePath: [config.src, config.tmp + 'serve'],
    addRootSlash: false
  };

  var wiredepOptions = {
    directory: 'bower_components',
    exclude: [/bootstrap\.js/, /bootstrap\.css/, /bootstrap\.css/, /foundation\.css/]
  };

  return gulp.src(config.src + '*.html')
    .pipe($.inject(injectStyles, injectOptions))
    .pipe($.inject(injectScripts, injectOptions))
    .pipe(wiredep(wiredepOptions))
    .pipe(gulp.dest(config.tmp + 'serve'));

});
