/// <reference path="../../../typings/app.d.ts" />
module app {
    'use strict';


    class DeliverablesByMonthController {
        deliverableDefinitionsByMonth:DeliverableDefinition[];
        deliverableFeedback:{[key:number]:DeliverableFeedback};
        displayPeriod:string;
        gotData = false;
        outstandingDefinitions:DeliverableDefinition[];
        searchString = '';
        visibleDeliverables:Deliverable[];
        //showFeedbackPanel = false;

        deliverableGrid = {
            //showGridFooter: true,
            autoResize: true,
            columnDefs: undefined,
            data: undefined,
            enableFiltering: true,
            enableGridMenu: true,
            enableSorting: true,
            showGroupPanel: true,
            useExternalFiltering: true
        };

        constructor(private $scope, private $q, private $filter,
                    private deliverableFeedbackModel:DeliverableFeedbackModel, chartService:ChartService,
                    private $state, private fiscalYear,
                    private fiscalMonth:number, private deliverableDefinitionsModel:DeliverableDefinitionsModel,
                    private deliverablesModel:DeliverablesModel, private deliverablesService:DeliverablesService,
                    private calendarService:CalendarService, private deliverableAccessLogModel:DeliverableAccessLogModel,
                    private uiGridService) {

            var vm = this;

            vm.displayPeriod = calendarService.generateDisplayPeriod(fiscalMonth, fiscalYear);
            //vm.showFeedbackPanel = false;
            vm.deliverableGrid.columnDefs = uiGridService.getDeliverableFields();

            vm.activate();

        }

        activate() {
            var vm = this;
            //vm.gauge1 = new chartService.Gauge('Satisfaction');
            //vm.gauge2 = new chartService.Gauge('OTD');

            vm.$q.all([
                vm.deliverablesModel.getDeliverablesForMonth(vm.fiscalYear, vm.fiscalMonth),
                vm.deliverableDefinitionsModel.getDeliverableDefinitionsForMonth(vm.fiscalYear, vm.fiscalMonth),
                vm.deliverableFeedbackModel.getFyFeedback(vm.fiscalYear),
                vm.deliverableAccessLogModel.getFyAccessLogs(vm.fiscalYear)
            ])
                .then(function (resolvedPromises) {
                    vm.visibleDeliverables = resolvedPromises[0];
                    vm.deliverableDefinitionsByMonth = resolvedPromises[1];
                    vm.outstandingDefinitions = vm.deliverablesService
                        .identifyOutstandingDefinitionsForMonth(vm.visibleDeliverables, vm.deliverableDefinitionsByMonth);

                    vm.deliverableFeedback = resolvedPromises[2];

                    //vm.gauge1.updateGaugeValue(chartService.getSatisfactionRating(vm.visibleDeliverables));
                    //vm.gauge2.updateGaugeValue(chartService.getOnTimeDeliveryRating(vm.visibleDeliverables));

                    //Create a copy of the array and references
                    vm.deliverableGrid.data = vm.visibleDeliverables.slice(0);

                    /** Filter grid contents when filter string is updated */
                    vm.$scope.$watch('vm.searchString', function (newVal, oldVal) {
                        if (newVal !== oldVal) {
                            vm.deliverableGrid.data = vm.$filter('filter')(vm.visibleDeliverables, newVal);
                        }
                    });

                    vm.gotData = true;
                });

        }

        decreaseDate() {
            var vm = this;
            var updatedMonth = vm.fiscalMonth - 1;
            var updatedYear = vm.fiscalYear;

            // if we're flipping to the previous year, decrement current fiscal year bucket
            if (updatedMonth === 0) {
                updatedYear = updatedYear - 1;
                updatedMonth = 12;
            }

            vm.$state.go('deliverables.monthly', {fy: updatedYear, mo: updatedMonth});
        }

        // 10/1 starts the new fiscal year
        increaseDate() {
            var vm = this;
            var updatedMonth = vm.fiscalMonth + 1;
            var updatedYear = vm.fiscalYear;

            // if we're flipping to the new year, increment current fiscal year bucket
            if (updatedMonth > 12) {
                updatedYear = vm.fiscalYear + 1;
                updatedMonth = 1;
            }

            vm.$state.go('deliverables.monthly', {fy: updatedYear, mo: updatedMonth});
        }


    }

    angular
        .module('pmam-deliverables')
        .controller('deliverablesByMonthController', DeliverablesByMonthController);

}
