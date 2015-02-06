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
                url: '/types?fy',
                templateUrl: 'modules/deliverables/views/deliverableDefinitionsView.html',
                controller: 'definitionsController',
                controllerAs: 'vm'
            })

            .state('deliverable', {
                url: '/deliverable/:id',
                templateUrl: 'modules/deliverables/views/deliverableFormEditView.html',
                controller: 'deliverableFormEditController',
                controllerAs: 'vm',
                resolve: {
                    deliverableRecord: function ($stateParams, $q, deliverablesModel, toastr) {

                        var deferred = $q.defer();

                        /** Verify a valid id is passed in */
                        if (isNaN($stateParams.id)) {
                            toastr.error('A valid ID needs to be provided.');
                            deferred.resolve(null);
                        } else {
                            var deliverableId = parseInt($stateParams.id),
                                deliverableRecord = deliverablesModel.getCachedEntity(deliverableId);

                            if (deliverableRecord) {
                                deferred.resolve(deliverableRecord);
                            } else {
                                deliverablesModel.getListItemById(deliverableId)
                                    .then(function (deliverable) {
                                        deferred.resolve(deliverable);
                                    });
                            }
                        }


                        return deferred.promise;

                    }
                }
            })

            .state('newInstance', {
                url: '/deliverable?fy&deliverableTypeId',
                templateUrl: 'modules/deliverables/views/deliverableFormNewView.html',
                controller: 'deliverableFormNewController',
                controllerAs: 'vm'
            })

            .state('deliverables.main', {
                url: '/main?fy&mo',
                templateUrl: 'modules/deliverables/views/deliverablesView.html',
                controller: 'deliverablesController',
                controllerAs: 'vm'
            })

            .state('deliverables.instances', {
                url: '/instances?fy&id',
                templateUrl: 'modules/deliverables/views/deliverableInstancesView.html',
                controller: 'deliverableInstancesController',
                controllerAs: 'vm',
                resolve: {
                    fy: function($stateParams, calendarService) {
                        return isNaN($stateParams.fy) ? calendarService.getCurrentFiscalYear() : parseInt($stateParams.fy);
                    },
                    fyDefinitions: function(deliverableDefinitionsModel, $stateParams, fy) {
                        return deliverableDefinitionsModel.getFyDefinitions(fy);
                    },
                    selectedDefinition: function($stateParams, $q, fyDefinitions) {
                        var deferred = $q.defer();
                        if (isNaN($stateParams.id)) {
                            /** No ID was provided */

                            if(fyDefinitions.count() < 1) {
                                /** No definitions for this month were found */
                                deferred.resolve(null);
                            } else {
                                /** Set to the first definition */
                                deferred.resolve(fyDefinitions.first());
                            }

                        } else {
                            var definitionId = parseInt($stateParams.id);
                            deferred.resolve(fyDefinitions[definitionId]);
                        }

                        return deferred.promise;
                    }
                }

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
