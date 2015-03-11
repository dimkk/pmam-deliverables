module.exports = function() {

    var app = "./src/";
    var bower = "./bower_components/";

    var config = {
        "app": app,
        "client": app + "",
        "index": app + "index.html",
        "htmltemplates": [
            app + "**/*.html",
            "!" + app + "index.html"
        ],
        "projectcss": [
            app + "styles/**/*.css",
            "!" + app + "styles/**/bootstrap.css",
            "!" + app + "styles/**/bower.css"
        ],
        "projectless": app + "styles/less/*.less",
        "projectjs": [
            app + "shims/*.js",
            app + "**/*.js",
            "!" + app + "common/app.module.js",
            "!" + app + "**/*.spec.js",
            "!" + app + "**/*.mock.js"
        ],
        "specs": [
            "./test/**/*.spec.js",
            app + "**/*.spec.js"
        ],
        "fonts": [
            bower + "font-awesome/fonts/**/*.*"
        ],
        "images": [
            app + "images/**/*.*"
        ],
        "build": "./dist/",
        "report": "./report/",
        "docs": "./docs/",
        "offlinexml": [
            "./xml-cache/**/*.xml",
            bower + "angular-point/test/mock/xml/**/*.xml"
        ],
        "cdnjs": [
            bower + "jquery/dist/jquery.js",
            bower + "angular/angular.js",
            bower + "angular-messages/angular-messages.js",
            bower + "jquery-ui/jquery-ui.js",
            bower + "angular-sanitize/angular-sanitize.js",
            bower + "angular-animate/angular-animate.js",
            bower + "angular-touch/angular-touch.js"
        ],
        "devjs": [
            bower + "chance/chance.js",
            "./test/mocks/**/*.js",
            bower + "angular-mocks/angular-mocks.js",
            bower + "angular-point/test/mock/apMockBackend.js"
        ],
        "distjs": [
            app + "common/app.module.js"
        ],
        "components": [
            bower + "angular-point/dist/angular-point.js",
            bower + "angular-point-attachments/dist/apAttachments.js",
            bower + "angular-point-discussion-thread/dist/apDiscussionThread.js",
            bower + "angular-point-modal/dist/apModalService.js",
            bower + "angular-point-group-manager/dist/apGroupManager.js",
            bower + "angular-point-form-control/dist/apInputControl.js",
            bower + "angular-point-offline-generator/dist/ap-offline-generator.js",
            bower + "angular-point-sync/dist/angular-point-sync.js"
        ],
        "vendorjs": [
            bower + "moment/moment.js",
            bower + "moment-business/dist/moment-business.js",
            bower + "angular-google-chart/ng-google-chart.js",
            bower + "lodash/dist/lodash.js",
            bower + "lodash-deep/lodash-deep.js",
            bower + "firebase/firebase.js",
            bower + "angular-ui-router/release/angular-ui-router.js",
            bower + "angular-bootstrap/ui-bootstrap.js",
            bower + "angular-bootstrap/ui-bootstrap-tpls.js",
            bower + "angular-ui-utils/ui-utils.js",
            bower + "angular-ui-select/dist/select.js",
            bower + "angular-ui-date/src/date.js",
            bower + "angular-ui-sortable/sortable.js",
            bower + "ng-table/ng-table.js",
            bower + "angularfire/angularfire.js",
            bower + "angular-toastr/dist/angular-toastr.js",
            bower + "angular-loading-bar/build/loading-bar.js",
            bower + "angular-filter/dist/angular-filter.js"
        ],
        "vendorcss": [
            bower + "angular-ui-select/dist/select.css",
            bower + "animate.css/animate.css",
            bower + "angular-toastr/dist/angular-toastr.css",
            bower + "angular-loading-bar/build/loading-bar.css",
            bower + "font-awesome/css/font-awesome.min.css",
            bower + "angular-point-discussion-thread/dist/apDiscussionThread.css",
            app + "styles/**/*bootstrap.css",
            app + "styles/**/*bower.css"
        ]
    };
    return config;

}
