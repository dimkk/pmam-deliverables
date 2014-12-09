'use strict';

angular.module('pmam-deliverables')
    .config(function ($stateProvider, $urlRouterProvider) {

        // For any unmatched url, redirect to /state1
        $urlRouterProvider
            //Default deliverables view
            .when('/deliverables', '/deliverables/main')
            //Default instances view
            .when('/detail', '/detail/instances')
            //Default instances view
            .when('/definitions', '/definitions/types')
            //Default Route
            .otherwise('/deliverables');

        $stateProvider
            .state('deliverables', {
                url: '/deliverables',
                abstract: true,
                template: '<div ui-view></div>'
            })

            .state('definitions', {
                url: '/definitions',
                abstract: true,
                template: '<div ui-view></div>'
            })

            .state('definitions.types', {
                url: '/types',
                templateUrl: 'modules/definitions/deliverable-definitions.view.html',
                controller: 'definitionsController'
            })

            .state('deliverable', {
                url: '/deliverable/:id',
                templateUrl: 'modules/deliverables/views/deliverable-form.view.html',
                controller: 'deliverableFormController'
            })

            .state('newInstance', {
                url: '/deliverable?fy&deliverableTypeId',
                templateUrl: 'modules/deliverables/views/deliverableFormNewView.html',
                controller: 'newDeliverableFormController'
            })

            .state('deliverables.main', {
                url: '/main?fy&mo',
                templateUrl: 'modules/deliverables/views/deliverables.view.html',
                controller: 'deliverablesController'
            })

            .state('instances', {
                url: '/instances?fy&id',
                templateUrl: 'modules/detail/deliverable-instances.view.html',
                controller: 'deliverableInstancesController'
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
