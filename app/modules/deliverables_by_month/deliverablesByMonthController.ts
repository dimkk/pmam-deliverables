/// <reference path="../../../typings/app.d.ts" />
module app {
    'use strict';

    var vm: DeliverablesByMonthController;

    class DeliverablesByMonthController {
        deliverableDefinitionsByMonth:DeliverableDefinition[];
        deliverableFeedback:{[key:number]:DeliverableFeedback};
        gotData = false;
        outstandingDefinitions:DeliverableDefinition[];
        searchString = '';
        visibleDeliverables:Deliverable[];
        subTitle: string;
        subTitleInfo: string;
        subTitleIcon: string;
        fiscalData;

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
                    private calendarService:CalendarService, private deliverableAccessMetricsModel: DeliverableAccessMetricsModel,
                    private uiGridService) {

            vm = this;

            //vm.showFeedbackPanel = false;
            vm.deliverableGrid.columnDefs = uiGridService.getDeliverableFields();

            //SubTitle and Icon
            vm.subTitle = "MONTHLY SNAPSHOT";
            vm.subTitleIcon = "fa fa-calendar icon-padding";

            //Fiscal Data and Watch
            vm.fiscalData = { fiscalMonth: fiscalMonth, fiscalYear: fiscalYear };
            $scope.$watch('vm.fiscalData', (newVal, oldVal) => {
                if (newVal && newVal !== oldVal) {
                    vm.$state.go('deliverables.monthly', { fy: vm.fiscalData.fiscalYear, mo: vm.fiscalData.fiscalMonth });
                }
            }, true);

            vm.activate();
        }

        activate() {
            //var vm = this;
            //vm.gauge1 = new chartService.Gauge('Satisfaction');
            //vm.gauge2 = new chartService.Gauge('OTD');

            vm.$q.all([
                vm.deliverablesModel.getDeliverablesForMonth(vm.fiscalYear, vm.fiscalMonth),
                vm.deliverableDefinitionsModel.getDeliverableDefinitionsForMonth(vm.fiscalYear, vm.fiscalMonth),
                vm.deliverableFeedbackModel.getFyFeedback(vm.fiscalYear),
                vm.deliverableAccessMetricsModel.getFyAccessMetrics(vm.fiscalYear)
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
    }

    angular
        .module('pmam-deliverables')
        .controller('deliverablesByMonthController', DeliverablesByMonthController);

}
