'use strict';

angular.module('pmam-deliverables')
    .config(function ($stateProvider, $urlRouterProvider) {

        // For any unmatched url, redirect to /state1
        $urlRouterProvider
            //Default deliverables view
            .when('/deliverables', '/deliverables/main')
            //Default Route
            .otherwise('/deliverables');

        $stateProvider
            .state('deliverables', {
                url: '/deliverables',
                abstract: true,
                template: '<div ui-view class="fadeIn"></div>'
            })

            .state('deliverables.types', {
                url: '/types',
                templateUrl: 'modules/deliverables/views/deliverableDefinitionsView.html',
                controller: 'definitionsController'
            })

            .state('deliverable', {
                url: '/deliverable/:id',
                templateUrl: 'modules/deliverables/views/deliverableFormView.html',
                controller: 'deliverableFormController'
            })

            .state('newInstance', {
                url: '/deliverable?fy&deliverableTypeId',
                templateUrl: 'modules/deliverables/views/deliverableFormNewView.html',
                controller: 'newDeliverableFormController'
            })

            .state('deliverables.main', {
                url: '/main?fy&mo',
                templateUrl: 'modules/deliverables/views/deliverablesView.html',
                controller: 'deliverablesController'
            })

            .state('deliverables.instances', {
                url: '/instances?fy&id',
                templateUrl: 'modules/deliverables/views/deliverableInstancesView.html',
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
