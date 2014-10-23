var paths = require('./gulp.config.json');

module.exports = function (config) {
    var envFiles = paths.environment.dev,
        files = envFiles.cdnjs.concat(paths.vendorjs, paths.modules,
        envFiles.js, paths.projectjs, paths.specs),
        preprocessors= {};

    preprocessors[paths.projectjs] = ['coverage'];

    config.set({
        // base path, that will be used to resolve files and exclude
        //basePath: 'app/',

        // testing framework to use (jasmine/mocha/qunit/...)
        frameworks: ['jasmine'],

        files: files,

        // list of files / patterns to exclude
        exclude: [],

        // web server port
        port: 8080,

        // level of logging
        // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
        logLevel: config.LOG_INFO,


        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: false,

        //preprocessors: preprocessors,
        preprocessors: {
            'scripts{services, factories, models, directives}/**/*.js': ['coverage']
        },

        urlRoot: '/base',

        // Start these browsers, currently available:
        // - Chrome
        // - ChromeCanary
        // - Firefox
        // - Opera
        // - Safari (only Mac)
        // - PhantomJS
        // - IE (only Windows)
        browsers: ['PhantomJS'],
        //browsers: ['Chrome'],

        reporters: ['progress', 'coverage'],

        // Continuous Integration mode
        // if true, it capture browsers, run tests and exit
        singleRun: true
    });
};
