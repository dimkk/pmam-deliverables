(function () {
    'use strict';

    angular
        .module('pmam-deliverables', [
            //Angular Components
            'ngSanitize',
            'ngAnimate',
            'ngMessages',
            'googlechart',

            //Angular UI
            'ui.router',
            'ui.bootstrap',
            'ui.date',
            'ui.utils',
            'ui.select',
            'ui.sortable',
            'ui.highlight',

            'ui.grid',
            'ui.grid.edit',
            'ui.grid.cellNav',
            'ui.grid.pinning',
            'ui.grid.resizeColumns',
            'ui.grid.moveColumns',
            'ui.grid.rowEdit',
            //'ui.grid.grouping',
            'ui.grid.selection',
            'ui.grid.autoResize',
            'ui.grid.expandable',

            //Plugins
            'ngTable',
            'firebase',
            'toastr',
            'angular-loading-bar',
            'angular.filter',
            'monospaced.elastic',

            //SP-Angular
            'angularPoint',

            //Mock Support
            'ngMockE2E'


        ])
        .constant('mockUser', {
            lookupId: 441,
            lookupValue: "Hatcher CIV Scott B"
        })
        .run(function ($httpBackend) {

            // Don't mock the html views
            $httpBackend.whenGET(/\.html$/).passThrough();

            $httpBackend.whenGET(/\.xml$/).passThrough();

        });

})();
