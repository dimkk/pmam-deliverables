module.exports = function () {
    var tmp = './.tmp/';
    var src = './src/';
    var bower = {
        json: require('./bower.json'),
        directory: './bower_components/',
        ignorePath: '../..'
    };
    var config = {
        "src": src,
        "tmp": tmp,
        "index": src + "index.html",
        "htmltemplates": [
            src + "**/*.html",
            "!" + src + "index.html"
        ],
        "projectcss": [
            src + "styles/**/*.css",
            "!" + src + "styles/**/bootstrap.css",
            "!" + src + "styles/**/bower.css"
        ],
        "projectless": src + "styles/less/*.less",
        "projectjs": [
            src + "**/*.js",
            "!" + src + "common/app.module.js",
            "!" + src + "**/*.spec.js",
            "!" + src + "**/*.mock.js"
        ],
        "specs": [
            "./test/**/*.spec.js",
            src + "**/*.spec.js"
        ],
        "fonts": [
            bower.directory + "font-awesome/fonts/**/*.*"
        ],
        "images": [
            src + "images/**/*.*"
        ],
        "build": "./dist/",
        "report": "./report/",
        "docs": "./docs/",
        "offlinexml": [
            "./xml-cache/**/*.xml",
            bower.directory + "angular-point/test/mock/xml/**/*.xml"
        ]
        //"cdnjs": [
        //    bower.directory + "jquery/dist/jquery.js",
        //    bower.directory + "angular/angular.js",
        //    bower.directory + "angular-messages/angular-messages.js",
        //    bower.directory + "jquery-ui/jquery-ui.js",
        //    bower.directory + "angular-sanitize/angular-sanitize.js",
        //    bower.directory + "angular-animate/angular-animate.js",
        //    bower.directory + "angular-touch/angular-touch.js"
        //],
        //"devjs": [
        //    bower.directory + "chance/chance.js",
        //    "./test/mocks/**/*.js",
        //    bower.directory + "angular-mocks/angular-mocks.js",
        //    bower.directory + "angular-point/test/mock/apMockBackend.js"
        //],
        //"distjs": [
        //    src + "common/app.module.js"
        //],
        //"modules": [
        //    bower.directory + "angular-point/dist/angular-point.js",
        //    bower.directory + "angular-point-attachments/dist/apAttachments.js",
        //    bower.directory + "angular-point-discussion-thread/dist/apDiscussionThread.js",
        //    bower.directory + "angular-point-modal/dist/apModalService.js",
        //    bower.directory + "angular-point-group-manager/dist/apGroupManager.js",
        //    bower.directory + "angular-point-form-control/dist/apInputControl.js",
        //    bower.directory + "angular-point-offline-generator/dist/ap-offline-generator.js",
        //    bower.directory + "angular-point-sync/dist/angular-point-sync.js"
        //],
        //"vendorjs": [
        //    bower.directory + "moment/moment.js",
        //    bower.directory + "moment-business/dist/moment-business.js",
        //    bower.directory + "angular-google-chart/ng-google-chart.js",
        //    bower.directory + "lodash/dist/lodash.js",
        //    bower.directory + "lodash-deep/lodash-deep.js",
        //    bower.directory + "firebase/firebase.js",
        //    bower.directory + "angular-ui-router/release/angular-ui-router.js",
        //    bower.directory + "angular-bootstrap/ui-bootstrap.js",
        //    bower.directory + "angular-bootstrap/ui-bootstrap-tpls.js",
        //    bower.directory + "angular-ui-utils/ui-utils.js",
        //    bower.directory + "angular-ui-select/dist/select.js",
        //    bower.directory + "angular-ui-date/src/date.js",
        //    bower.directory + "angular-ui-sortable/sortable.js",
        //    bower.directory + "ng-table/ng-table.js",
        //    bower.directory + "angularfire/angularfire.js",
        //    bower.directory + "angular-toastr/dist/angular-toastr.js",
        //    bower.directory + "angular-loading-bar/build/loading-bar.js",
        //    bower.directory + "angular-filter/dist/angular-filter.js"
        //],
        //"vendorcss": [
        //    bower.directory + "angular-ui-select/dist/select.css",
        //    bower.directory + "animate.css/animate.css",
        //    bower.directory + "angular-toastr/dist/angular-toastr.css",
        //    bower.directory + "angular-loading-bar/build/loading-bar.css",
        //    bower.directory + "font-awesome/css/font-awesome.min.css",
        //    bower.directory + "angular-point-discussion-thread/dist/apDiscussionThread.css",
        //    src + "styles/**/*bootstrap.css",
        //    src + "styles/**/*bower.css"
        //]
    }

    return config;
}
