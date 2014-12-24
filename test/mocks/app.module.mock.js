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

            //Plugins
            'ngTable',
            'firebase',
            'toastr',
            'angular-loading-bar',
            'angular.filter',

            //SP-Angular
            'angularPoint',

            //Mock Support
            'ngMockE2E'


        ])
        .run(function ($httpBackend) {

            // Don't mock the html views
            $httpBackend.whenGET(/\.html$/).passThrough();

            $httpBackend.whenGET(/\.xml$/).passThrough();

        });

})();
