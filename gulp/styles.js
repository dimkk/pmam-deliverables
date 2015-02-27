'use strict';

var gulp = require('gulp');

var config = gulp.config;

var $ = require('gulp-load-plugins')();

gulp.task('styles', function () {

  var lessOptions = {
    config: [
      'bower_components',
      config.src + 'common',
      config.src + 'modules'
    ]
  };

  var injectFiles = gulp.src([
    config.src + 'styles/**/*.less',
    '!' + config.src + 'common/index.less',
    '!' + config.src + 'common/vendor.less'
  ], { read: false });

  var injectOptions = {
    transform: function(filePath) {
      filePath = filePath.replace(config.src + 'common/', '');
      filePath = filePath.replace(config.src + 'modules/', '../modules/');
      return '@import \'' + filePath + '\';';
    },
    starttag: '// injector',
    endtag: '// endinjector',
    addRootSlash: false
  };

  var indexFilter = $.filter('index.less');

  return gulp.src([
    config.src + 'common/index.less',
    config.src + 'common/vendor.less'
  ])
    .pipe(indexFilter)
    .pipe($.inject(injectFiles, injectOptions))
    .pipe(indexFilter.restore())
    .pipe($.less())

  .pipe($.autoprefixer())
    .on('error', function handleError(err) {
      console.error(err.toString());
      this.emit('end');
    })
    .pipe(gulp.dest(config.tmp + 'serve/common/'));
});
