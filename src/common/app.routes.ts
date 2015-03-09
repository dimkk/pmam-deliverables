/// <reference path="../../typings/tsd.d.ts" />
(():void => {
    'use strict';

    angular
        .module('pmam-deliverables')
        .config(routes);

    function routes($stateProvider: ng.ui.IStateProvider, $urlRouterProvider: ng.ui.IUrlRouterProvider) {

        // For any unmatched url, redirect to /state1
        $urlRouterProvider
            //Default deliverables view
            .when('/deliverables', '/deliverables/main')
            //Default Route
            .otherwise('/deliverables');

        $stateProvider
            .state('deliverables', {
                url: '/deliverables?fy',
                abstract: true,
                template: '<div ui-view class="fadeIn primary-view"></div>',
                resolve: {
                    /** Resolve at parent state so it's available to all child states */
                    fiscalYear: getFiscalYear
                }
            })

            .state('deliverables.summary', {
                url: '/summary',
                templateUrl: 'components/deliverables/views/deliverablesSummaryView.html',
                controller: 'deliverableSummaryController',
                controllerAs: 'vm'
            })

            .state('deliverables.monthly', {
                url: '/main?mo',
                templateUrl: 'components/deliverables/views/deliverablesView.html',
                controller: 'deliverablesController',
                controllerAs: 'vm'
            })

            .state('deliverables.instances', {
                url: '/instances?id',
                templateUrl: 'components/deliverables/views/deliverableInstancesView.html',
                controller: 'deliverableInstancesController',
                controllerAs: 'vm',
                resolve: {
                    fyDefinitions: getFyDefinitions,
                    selectedDefinition: getSelectedDefinitionfunction
                }
            })

            .state('deliverables.types', {
                url: '/types',
                templateUrl: 'components/deliverables/views/deliverableDefinitionsView.html',
                controller: 'definitionsController',
                controllerAs: 'vm'
            })

            .state('deliverable', {
                url: '/deliverable/:id?activeTab', //['main', 'discussion'] with default = main
                templateUrl: 'components/deliverableForm/deliverableFormEditView.html',
                controller: 'deliverableFormEditController',
                controllerAs: 'vm',
                resolve: {
                    deliverableRecord: getDeliverableRecord
                }
            })

            //Todo Find a better name for this state (no caps)
            .state('newInstance', {
                url: '/deliverable?fy&mo&deliverableTypeId',
                templateUrl: 'components/deliverableForm/deliverableFormNewView.html',
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


        function getFiscalYear($stateParams, calendarService) {
            return isNaN($stateParams.fy) ? calendarService.getCurrentFiscalYear() : parseInt($stateParams.fy);
        }

        function getFyDefinitions(deliverableDefinitionsModel, fiscalYear) {
            return deliverableDefinitionsModel.getFyDefinitions(fiscalYear);
        }

        function getSelectedDefinitionfunction($stateParams, $q, fyDefinitions): void{
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

        function getDeliverableRecord($stateParams, $q, deliverablesModel, toastr): void {

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
})();
