module app {
    'use strict';

    var modules = [    'ngSanitize', 'ngAnimate', 'googlechart', 'ui.router', 'ui.bootstrap',
        'ui.date', 'ui.utils', 'ui.select', 'ui.sortable', 'ui.highlight', 'ui.grid', 'ui.grid.edit',
        'ui.grid.cellNav', 'ui.grid.pinning', 'ui.grid.resizeColumns', 'ui.grid.moveColumns',
        'ui.grid.rowEdit', 'ui.grid.selection', 'ui.grid.autoResize', 'ui.grid.expandable', 'ngTable',
        'firebase', 'toastr', 'angular-loading-bar', 'angular.filter', 'monospaced.elastic', 'angularPoint'
    ];

    var offline = false;

    if(window.location.href.indexOf('localhost') > -1 ||
        window.location.href.indexOf('http://0.') > -1 ||
        window.location.href.indexOf('http://10.') > -1 ||
        window.location.href.indexOf('http://127.') > -1 ||
        window.location.href.indexOf('http://192.') > -1) {

        offline = true;
        /** Add in mock library if working offline to prevent us from making outside requests */
        modules.push('ngMockE2E');
    }

    angular.module('pmam-deliverables', modules);

    if(offline) {
        angular.module('pmam-deliverables')
        /** Set a default user in offline */
            .constant('mockUser', {
                lookupId: 441,
                lookupValue: "Hatcher CIV Scott B"
            })
        /** Allow requests for specific file types to be allowed through */
            .run(function ($httpBackend) {

                // Don't mock the html views
                $httpBackend.whenGET(/\.html$/).passThrough();

                $httpBackend.whenGET(/\.xml$/).passThrough();

            });

    }
}
