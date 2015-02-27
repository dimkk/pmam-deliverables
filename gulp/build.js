'use strict';

var gulp = require('gulp');
var pkg = require('../package');

var config = gulp.config;

var $ = require('gulp-load-plugins')({
  pattern: ['gulp-*', 'main-bower-files', 'uglify-save-license', 'del']
});

gulp.task('partials', function () {
  return gulp.src([
    config.src + '{common,modules}/**/*.html',
    config.tmp + '{common,modules}/**/*.html'
  ])
    .pipe($.minifyHtml({
      empty: true,
      spare: true,
      quotes: true
    }))
    .pipe($.angularTemplatecache('templateCacheHtml.js', {
      module: pkg.module
    }))
    .pipe(gulp.dest(config.tmp + 'partials/'));
});

gulp.task('html', ['inject', 'partials'], function () {
  var partialsInjectFile = gulp.src(config.tmp + 'partials/templateCacheHtml.js', { read: false });
  var partialsInjectOptions = {
    starttag: '<!-- inject:partials -->',
    ignorePath: config.tmp + 'partials',
    addRootSlash: false
  };

  var htmlFilter = $.filter('*.html');
  var jsFilter = $.filter('**/*.js');
  var cssFilter = $.filter('**/*.css');
  var assets;

  return gulp.src(config.tmp + 'serve/*.html')
    .pipe($.inject(partialsInjectFile, partialsInjectOptions))
    .pipe(assets = $.useref.assets())
    //.pipe($.rev())
    .pipe(jsFilter)
    .pipe($.ngAnnotate())
    //.pipe($.uglify({preserveComments: $.uglifySaveLicense}))
    .pipe(jsFilter.restore())
    .pipe(cssFilter)
    .pipe($.replace('../bootstrap/fonts', 'fonts'))
    .pipe($.csso())
    .pipe(cssFilter.restore())
    .pipe(assets.restore())
    .pipe($.useref())
    //.pipe($.revReplace())
    .pipe(htmlFilter)
    .pipe($.minifyHtml({
      empty: true,
      spare: true,
      quotes: true
    }))
    .pipe(htmlFilter.restore())
    .pipe(gulp.dest(config.dist))
    .pipe($.size({ title: config.dist, showFiles: true }));
});

gulp.task('images', function () {
  return gulp.src(config.src + 'images/**/*')
    .pipe(gulp.dest(config.dist + 'images/'));
});

gulp.task('fonts', function () {
  return gulp.src($.mainBowerFiles())
    .pipe($.filter('**/*.{eot,svg,ttf,woff}'))
    .pipe($.flatten())
    .pipe(gulp.dest(config.dist + 'fonts/'));
});

gulp.task('misc', function () {
  return gulp.src(config.src + '**/*.ico')
    .pipe(gulp.dest(config.dist));
});

gulp.task('clean', function (done) {
  $.del([config.dist, config.tmp], done);
});

gulp.task('build', ['html', 'images', 'fonts', 'misc']);
