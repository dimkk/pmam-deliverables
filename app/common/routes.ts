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
                url: '/deliverables?fy&task',
                abstract: true,
                template: '<div ui-view />',

                resolve: {
                    fiscalYear: function ($stateParams, calendarService: CalendarService) {
                        return isNaN($stateParams.fy) ? calendarService.getCurrentFiscalYear() : parseInt($stateParams.fy);
                    },
                    selectedTask: function ($stateParams) {
                        return ($stateParams.task) ? $stateParams.task : "All";
                    }
                }
            })

                .state('deliverables.summary', {
                url: '/summary?ct',
                templateUrl: 'modules/deliverable_summary/deliverablesSummaryView.html',
                controller: 'deliverableSummaryController',
                controllerAs: 'vm',
               // params: { 'task': null, 'chartType': null },
                resolve: {
                    selectedChart: function ($stateParams) {
                        return ($stateParams.ct) ? $stateParams.ct :  "Column Chart";
                        }
                    }
                })

                .state('deliverables.monthly', {
                    url: '/main?mo',
                    templateUrl: 'modules/deliverables_by_month/deliverablesView.html',
                    controller: 'deliverablesByMonthController',
                    controllerAs: 'vm',
                    resolve: {
                        fiscalMonth: function($stateParams, calendarService:CalendarService) {
                            /** $state query string params return as strings, if they exist and can be converted to an int do it,
                             otherwise use the current fiscal year and month */
                            return isNaN($stateParams.mo) ? calendarService.getCurrentFiscalMonth() : parseInt($stateParams.mo);
                        }
                    }
                })

                .state('deliverables.instances', {
                    url: '/instances?id&onTime&feedbackStatus',
                    templateUrl: 'modules/deliverable_instances/deliverableInstancesView.html',
                    controller: 'deliverableInstancesController',
                    controllerAs: 'vm',
                    resolve: {
                        availableStatus: function ($stateParams) {
                            return $stateParams.feedbackStatus;
                        },
                        onTimeStatus: function ($stateParams) {
                            return $stateParams.onTime;
                        },
                        fyDefinitions: function (deliverableDefinitionsModel:DeliverableDefinitionsModel,
                                                 $stateParams,$filter,
                                                 fiscalYear: number) {
                           return deliverableDefinitionsModel.getFyDefinitions(fiscalYear);
                         },
                        selectedDefinition: function ($stateParams, $q, fyDefinitions: ap.IIndexedCache<DeliverableDefinition>) {
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
                    url: '/deliverable/:id?activeTab&task', //['main', 'discussion'] with default = main
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

                        },
                        selectedTask: function ($stateParams) {
                            return ($stateParams.task) ? $stateParams.task : "All";
                        }
                    }
                })

                //Todo Find a better name for this state (no caps)
                .state('newInstance', {
                    url: '/deliverable?fy&mo&deliverableTypeId',
                    templateUrl: 'modules/deliverable_forms/deliverableFormNewView.html',
                    controller: 'deliverableFormNewController',
                    controllerAs: 'vm',
                    resolve: {
                        deliverableRecord:(calendarService:CalendarService,
                                           $stateParams:{fy?:string; mo?:string; deliverableTypeId?:string;},
                                           deliverablesModel:DeliverablesModel) => {

                            var fiscalYear = isNaN($stateParams.fy) ? calendarService.getCurrentFiscalYear() : parseInt($stateParams.fy);
                            var fiscalMonth = isNaN($stateParams.mo) ? calendarService.getCurrentFiscalMonth() : parseInt($stateParams.mo);
                            /** Instantiate new deliverable record with default values */
                            return deliverablesModel.createEmptyItem({
                                fy: fiscalYear,
                                fiscalMonth: fiscalMonth,
                                startDate: new Date(),
                                submissionDate: new Date()
                            });
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

        }
    }

    angular.module('pmam-deliverables')
        .config(Routes);
}

