'use strict';

angular.module('pmam-deliverables')
    .config(function ($stateProvider, $urlRouterProvider) {

        // For any unmatched url, redirect to /state1
        $urlRouterProvider
            //Default Phasing Plan View
            .when('/deliverables', '/deliverables/main')
            //Default Route
            .otherwise('/deliverables');

        $stateProvider
            .state('deliverables', {
                url: '/deliverables',
                abstract: true,
                template: '<div ui-view></div>'
            })

            .state('deliverables.main', {
                url: '/main',
                templateUrl: 'modules/deliverables/views/deliverables.view.html',
                controller: 'deliverablesCtrl'
            })

            .state('deliverables.definitions', {
                url: '/definitions?fy',
                templateUrl: 'modules/deliverables/views/deliverable-definitions.view.html',
                controller: 'deliverableDefinitionsCtrl'
            })

            .state('deliverables.definitions.detail', {
                url: '/:id',
                templateUrl: 'modules/deliverables/views/deliverable-form.view.html',
                controller: 'deliverableDefinitionsCtrl'
            })

            //Group Manager
            .state('groupmanager', {
                url: '/group_manager',
                templateUrl: 'bower_components/angular-point-group-manager/src/group_manager_view.html',
                controller: 'apGroupManagerCtrl'
            })

            //Offline
            .state('offline', {
                url: '/offline',
                templateUrl: 'bower_components/angular-point-offline-generator/src/ap-offline-generator-view.html',
                controller: 'generateOfflineCtrl'
            });

    });
