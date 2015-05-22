/// <reference path="../../../typings/app.d.ts" />
module app {
    'use strict';

    var vm: DeliverableInstancesController;



    /* @ngInject */
    class DeliverableInstancesController {
        //gauge1:Object;
        //gauge2:Object;
        //deliverableGrid:Object;
        gotData = false;
        //showFeedback = false;
        visibleDeliverables: Deliverable[] = [];
        subTitle: string;
        subTitleInfo: string;
        subTitleIcon: string;
        fiscalData;
        definitions: DeliverableDefinition[];
        activeTask;
        activeFilters:{key: string, value: string }[]=[];

        deliverableGrid = {
            enableFiltering: true,
            useExternalFiltering: true,
            autoResize: true,
            enableGridMenu: true,
            enableSorting: true,
            //showGridFooter: true,
            showGroupPanel: true,
            columnDefs: undefined
        };
        constructor(private $state,private $scope, private $q,  deliverableFeedbackModel: DeliverableFeedbackModel,
            private deliverablesModel: DeliverablesModel, chartService, private fyDefinitions: DeliverableDefinition[],
            private deliverablesService: DeliverablesService,
            private deliverableDefinitionsModel: DeliverableDefinitionsModel,  private selectedDefinition: DeliverableDefinition, private fiscalYear: number,
            uiGridService, selectedTask, private availableStatus, private onTimeStatus) {

            vm = this;
            vm.deliverableGrid.columnDefs = uiGridService.getDeliverableFields();



            //SubTitle and Icon
            vm.subTitle = 'RELATED DELIVERABLES';
            vm.subTitleInfo = '';
            vm.subTitleIcon = 'fa fa-check-square icon-padding';

            //Task
            vm.activeTask = selectedTask;

            //active Filters
            if (availableStatus)
                vm.activeFilters.push({ key: 'Acceptable', value: availableStatus });
            if (onTimeStatus)
                vm.activeFilters.push({ key: 'On Time', value: onTimeStatus });


            /** Stop Everything if a valid definition isn't available */
            if (!selectedDefinition)
                vm.selectedDefinition = { title: 'All', id: undefined, deliverableNumber: 'All Deliverables', frequencyDescription: 'NA' };


            //Fiscal Data and Watch
            vm.fiscalData = { fiscalMonth: undefined, fiscalYear: fiscalYear };
            $scope.$watch('vm.fiscalData', (newVal, oldVal) => {
                if (newVal && newVal !== oldVal)
                    //vm.$state.go('deliverables.instances', vm.createArguments());//vm.$state.go('deliverables.instances', { fy: vm.fiscalData.fiscalYear, task: vm.activeTask, id: (vm.selectedDefinition.id ? vm.selectedDefinition.id : 0), onTime: undefined, availability: undefined});
                    vm.refreshInstancesView();
            }, true);

            $scope.$watch('vm.activeTask', (newVal, oldVal) => {
                if (newVal && newVal !== oldVal)
                    //vm.$state.go('deliverables.instances', vm.createArguments());//vm.$state.go('deliverables.instances', { fy: vm.fiscalData.fiscalYear, task: vm.activeTask, id: (vm.selectedDefinition.id ? vm.selectedDefinition.id : 0), onTime: undefined, availability: undefined });
                    vm.refreshInstancesView();
            });


            $scope.$watch('vm.selectedDefinition', (newVal, oldVal) => {
                if (newVal && newVal !== oldVal)
                    //vm.$state.go('deliverables.instances', vm.createArguments());// vm.$state.go('deliverables.instances', { fy: vm.fiscalData.fiscalYear, task: vm.activeTask, id: (vm.selectedDefinition.id ? vm.selectedDefinition.id : 0),onTime: undefined,availability:undefined});
                    vm.refreshInstancesView();
            });

            $scope.$watch('vm.activeFilters', (newVal, oldVal) => {
                if (newVal && newVal !== oldVal) {
                    //vm.$state.go('deliverables.instances', { fy: vm.fiscalData.fiscalYear, task: vm.activeTask, id: (vm.selectedDefinition.id ? vm.selectedDefinition.id : 0), onTime: undefined, availability: undefined });
                    vm.refreshInstancesView();
                }
            });

         vm.activate();
        }


        activate() {
            //vm.gauge1 = new chartService.Gauge('Satisfaction');
            //vm.gauge2 = new chartService.Gauge('OTD');
            // deliverableFeedbackModel.getFyFeedback(vm.fiscalData.fiscalYear),
            //deliverableAccessLogModel.getFyAccessLogs(vm.fiscalData.fiscalYear)

            vm.deliverablesModel.getFyDeliverables(vm.fiscalData.fiscalYear)
                .then(function (resolvedPromise) {
                vm.getDeliverables(resolvedPromise)
                    .then(function (resolvedDeliverables) {
                        vm.visibleDeliverables = resolvedDeliverables;
                        vm.deliverableGrid.data = resolvedDeliverables;
                vm.gotData = true;
                });
            });
        }

       /** Filters results based on the two known parameters*/
        filterDeliverables(data) {
            if (vm.onTimeStatus !== undefined) {
                data = _.filter(data, function (n) {
                    if (n.wasDeliveredOnTime().toString() === vm.onTimeStatus)
                        return n;
                });
            }
            if (vm.availableStatus !== undefined) {
                data = _.filter(data, function (n) {
                    if (n.getAcceptableStatus() === vm.availableStatus)
                        return n;
                });
            }
            return data;
        }

        getDeliverables(data) {
            var deferred = vm.$q.defer();
            var filteredDeliverables;
            if (vm.selectedDefinition.title !== 'All') {
                filteredDeliverables = _.toArray(vm.selectedDefinition.getDeliverablesForDefinition());

                //filter
                filteredDeliverables = vm.filterDeliverables(filteredDeliverables);

                deferred.resolve(filteredDeliverables);
            }
            else {
                vm.deliverableDefinitionsModel.getDeliverableDefinitionsByTaskNumber(vm.fiscalData.fiscalYear, vm.activeTask)
                    .then(function (resolvedPromise) {
                    filteredDeliverables = _.toArray(vm.deliverablesService.identifyDeliverablesForDefinitions(data, resolvedPromise));

                    //filter
                    filteredDeliverables = vm.filterDeliverables(filteredDeliverables);

                    deferred.resolve(filteredDeliverables);
            });
        }
            return deferred.promise;
        }
        refreshInstancesView() {
            var obj;
            var onTime = _.find(vm.activeFilters, { key: 'On Time' });
            var acceptable = _.find(vm.activeFilters, { key: 'Acceptable' });

            obj = {
                fy: vm.fiscalData.fiscalYear,
                task: vm.activeTask,
                id: (vm.selectedDefinition.id ? vm.selectedDefinition.id : 0),
                onTime: (onTime ? onTime.value : undefined),
                feedbackStatus: (acceptable ? acceptable.value : undefined)
            }
            vm.$state.go('deliverables.instances', obj);
        }
    }

    angular
        .module('pmam-deliverables')
        .controller('deliverableInstancesController', DeliverableInstancesController);

}
