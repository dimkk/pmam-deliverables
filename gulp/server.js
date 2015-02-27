'use strict';

var gulp = require('gulp');

var config = gulp.config;

var util = require('util');

var browserSync = require('browser-sync');

var middleware = require('./proxy');

function browserSyncInit(baseDir, files, browser) {
  browser = browser === undefined ? 'default' : browser;

  var routes = null;

    if(baseDir === config.src || (util.isArray(baseDir) && baseDir.indexOf(config.src) !== -1)) {
    routes = {
      '/bower_components': 'bower_components'
    };
  }

    console.log(routes);


  browserSync.instance = browserSync.init(files, {
    startPath: '/',
    server: {
      baseDir: baseDir,
      middleware: middleware,
      routes: routes
    },
    browser: browser
  });
}

gulp.task('serve', ['watch'], function () {
  browserSyncInit([
    config.tmp + 'serve/',
    config.src
  ], [
    config.tmp + 'serve/{common,modules}/**/*.css',
    config.tmp + 'serve/**/*.js',
    config.src + 'images/**/*',
    config.tmp + 'serve/*.html',
    config.tmp + 'serve/{common,modules}/**/*.html',
    config.src + '{common,modules}/**/*.html'
  ]);
});

gulp.task('serve:dist', ['build'], function () {
  browserSyncInit(config.dist);
});

gulp.task('serve:e2e', ['inject'], function () {
  browserSyncInit([config.tmp + 'serve', config.src], null, []);
});

gulp.task('serve:e2e-dist', ['build'], function () {
  browserSyncInit(config.dist, null, []);
});
