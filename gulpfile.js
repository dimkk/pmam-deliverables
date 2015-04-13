'use strict';

/* jshint camelcase:false */
var gulp = require('gulp');
var projectDir = __dirname + '/';
var config = require('./gulp.config')(projectDir);

require('angular-point-tools')(projectDir, config);
