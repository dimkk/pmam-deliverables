/// <reference path="../../typings/app.d.ts" />
module app {
    'use strict';

    class Routes {
        constructor($stateProvider:angular.ui.IStateProvider, $urlRouterProvider:angular.ui.IUrlRouterProvider) {

            // For any unmatched url, redirect to /state1
            $urlRouterProvider
                //Default deliverables view
                .when('/deliverables', '/deliverables/summary')
                //Default Route
                .otherwise('/deliverables');

            $stateProvider
                .state('deliverables', {
                    url: '/deliverables?fy',
                    abstract: true,
                    template: '<div ui-view />',
                    resolve: {
                        fiscalYear: function ($stateParams, calendarService:CalendarService) {
                            return isNaN($stateParams.fy) ? calendarService.getCurrentFiscalYear() : parseInt($stateParams.fy);
                        }
                    }
                })

                .state('deliverables.summary', {
                    url: '/summary',
                    templateUrl: 'modules/deliverable_summary/deliverablesSummaryView.html',
                    controller: 'deliverableSummaryController',
                    controllerAs: 'vm'
                })

                .state('deliverables.monthly', {
                    url: '/main?mo',
                    templateUrl: 'modules/deliverables_by_month/deliverablesView.html',
                    controller: 'deliverablesController',
                    controllerAs: 'vm'
                })

                .state('deliverables.instances', {
                    url: '/instances?id',
                    templateUrl: 'modules/deliverable_instances/deliverableInstancesView.html',
                    controller: 'deliverableInstancesController',
                    controllerAs: 'vm',
                    resolve: {
                        fyDefinitions: function (deliverableDefinitionsModel:DeliverableDefinitionsModel,
                                                 $stateParams:angular.ui.IStateParamsService,
                                                 fiscalYear:number) {
                            return deliverableDefinitionsModel.getFyDefinitions(fiscalYear);
                        },
                        selectedDefinition: function ($stateParams:{id?:string}, $q, fyDefinitions:ap.IIndexedCache<DeliverableDefinition>) {
                            var deferred = $q.defer();
                            if (isNaN($stateParams.id)) {
                                /** No ID was provided */

                                if (fyDefinitions.count() < 1) {
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

                .state('deliverables.types', {
                    url: '/types',
                    templateUrl: 'modules/deliverable_definitions/deliverableDefinitionsView.html',
                    controller: 'definitionsController',
                    controllerAs: 'vm'
                })

                .state('deliverable', {
                    url: '/deliverable/:id?activeTab', //['main', 'discussion'] with default = main
                    templateUrl: 'modules/deliverable_forms/deliverableFormEditView.html',
                    controller: 'deliverableFormEditController',
                    controllerAs: 'vm',
                    resolve: {
                        deliverableRecord: function ($stateParams:{id:string; activeTab?:string}, $q, deliverablesModel:DeliverablesModel, toastr) {

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

                //Todo Find a better name for this state (no caps)
                .state('newInstance', {
                    url: '/deliverable?fy&mo&deliverableTypeId',
                    templateUrl: 'modules/deliverable_forms/deliverableFormNewView.html',
                    controller: 'deliverableFormNewController',
                    controllerAs: 'vm'
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

        }
    }

    angular.module('pmam-deliverables')
        .config(Routes);
}
