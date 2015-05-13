module.exports = function (projectDir) {
    var app = projectDir + 'app/';
    var bowerDir = projectDir + 'bower_components/';
    var test = projectDir + 'test/';
    var tmp = projectDir + '.tmp/';

    var config = {
        /** Optionally Override */
        //app: app,
        //test: test,
        //tmp:tmp,
        cdnjs: [
            bowerDir + "jquery/dist/jquery.js",
            bowerDir + "angular/angular.js",
            bowerDir + "jquery-ui/jquery-ui.js",
            bowerDir + "angular-sanitize/angular-sanitize.js",
            bowerDir + "angular-animate/angular-animate.js",
            bowerDir + "angular-resource/angular-resource.js",
            bowerDir + "angular-touch/angular-touch.js",
            bowerDir + "angular-messages/angular-messages.js"
        ],
        modules: [
            bowerDir + "angular-point/dist/angular-point.js",
            bowerDir + "angular-point-attachments/dist/apAttachments.js",
            //bowerDir + "angular-point-discussion-thread/dist/apDiscussionThread.js",
            //bowerDir + "angular-point-modal/dist/apModalService.js",
            bowerDir + "angular-point-group-manager/dist/apGroupManager.js",
            //bowerDir + "angular-point-lookup-cache/dist/index.js",
            bowerDir + "angular-point-form-control/dist/apInputControl.js",
            bowerDir + "angular-point-offline-generator/dist/ap-offline-generator.js"
            //bowerDir + "angular-point-sync/dist/index.js"
        ],
        vendorjs: [
            bowerDir + 'moment/moment.js',
            bowerDir + 'moment-business/dist/moment-business.js',
            bowerDir + 'angular-google-chart/ng-google-chart.js',
            bowerDir + 'lodash/lodash.js',
            bowerDir + 'lodash-deep/lodash-deep.js',
            bowerDir + 'firebase/firebase.js',
            bowerDir + 'angular-ui-router/release/angular-ui-router.js',
            bowerDir + 'angular-bootstrap/ui-bootstrap.js',
            bowerDir + 'angular-bootstrap/ui-bootstrap-tpls.js',
            bowerDir + 'angular-ui-utils/ui-utils.js',
            bowerDir + 'angular-ui-select/dist/select.js',
            bowerDir + 'angular-ui-date/src/date.js',
            bowerDir + 'angular-ui-sortable/sortable.js',
            bowerDir + 'api-check/dist/api-check.js',
            bowerDir + 'angular-formly/dist/formly.js',
            bowerDir + 'angular-formly-templates-bootstrap/dist/angular-formly-templates-bootstrap.js',            bowerDir + 'ng-table/ng-table.js',
            bowerDir + 'angular-ui-grid/ui-grid.js',
            bowerDir + 'angularfire/dist/angularfire.js',
            bowerDir + "angular-toastr/dist/angular-toastr.tpls.min.js",
            bowerDir + 'angular-loading-bar/build/loading-bar.js',
            bowerDir + 'angular-filter/dist/angular-filter.js',
            bowerDir + 'angular-elastic/elastic.js'
        ],
        vendorcss: [
            bowerDir + 'angular-ui-select/dist/select.css',
            bowerDir + 'animate.css/animate.css',
            bowerDir + 'angular-toastr/dist/angular-toastr.css',
            bowerDir + 'angular-loading-bar/build/loading-bar.css',
            bowerDir + 'ng-table/ng-table.less',
            bowerDir + 'font-awesome/css/font-awesome.min.css',
            bowerDir + 'angular-point-discussion-thread/dist/apDiscussionThread.css',
            bowerDir + 'angular-ui-grid/ui-grid.css',
            app + 'styles/**/*bootstrap.css',
            app + 'styles/**/*bower.css'
        ]
    };

    return config;
};

