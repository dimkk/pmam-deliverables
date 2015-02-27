'use strict';

var gulp = require('gulp');

var $ = require('gulp-load-plugins')();

var wiredep = require('wiredep');

var config = gulp.config;

function runTests (singleRun, done) {
  var bowerDeps = wiredep({
    directory: 'bower_components',
    exclude: ['bootstrap-sass-official'],
    dependencies: true,
    devDependencies: true
  });

  var testFiles = bowerDeps.js.concat([
    config.tmp + 'serve/common/index.js',
    config.src + '{common,modules}/**/*.spec.js',
    config.src + '{common,modules}/**/*.mock.js'
  ]);

  gulp.src(testFiles)
    .pipe($.karma({
      configFile: 'karma.conf.js',
      action: (singleRun)? 'run': 'watch'
    }))
    .on('error', function (err) {
      // Make sure failed tests cause gulp to exit non-zero
      throw err;
    });
}

gulp.task('test', ['browserify'], function (done) { runTests(true /* singleRun */, done) });
gulp.task('test:auto', ['browserify'], function (done) { runTests(false /* singleRun */, done) });
