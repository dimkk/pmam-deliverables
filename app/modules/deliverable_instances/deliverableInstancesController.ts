/// <reference path="../../../typings/app.d.ts" />
module app {
    'use strict';

    var vm: DeliverableInstancesController;



    /* @ngInject */
    class DeliverableInstancesController {
        fiscalYearDisplay:string;
        gotData = false;
        searchString = '';
        showFeedback = false;
        deliverableGrid:Object;
        gauge1:Object;
        gauge2:Object;
        visibleDeliverables: Deliverable[] = [];
        constructor(private $state, $q,  deliverableFeedbackModel:DeliverableFeedbackModel,
                    deliverablesModel:DeliverablesModel, chartService, private fyDefinitions:DeliverableDefinition[],
                    private selectedDefinition:DeliverableDefinition, private fiscalYear:number,
                    deliverableAccessLogModel:DeliverableAccessLogModel, uiGridService) {

            vm = this;

            vm.fiscalYearDisplay = 'FY ' + fiscalYear.toString().slice(-2);

            vm.deliverableGrid = {
                enableFiltering: true,
                useExternalFiltering: true,
                autoResize: true,
                enableGridMenu: true,
                enableSorting: true,
                //showGridFooter: true,
                showGroupPanel: true,
                columnDefs: uiGridService.getDeliverableFields()
            };


            /** Stop Everything if a valid definition isn't available */
            if(!selectedDefinition) {
                return null;
            }

            activate();

            /**==================PRIVATE==================*/

            function activate() {

                vm.gauge1 = new chartService.Gauge('Satisfaction');
                vm.gauge2 = new chartService.Gauge('OTD');

                $q.all([
                    deliverablesModel.getFyDeliverables(fiscalYear),
                    deliverableFeedbackModel.getFyFeedback(fiscalYear),
                    deliverableAccessLogModel.getFyAccessLogs(fiscalYear)
                ]).then(function (resolvedPromises) {
                    vm.visibleDeliverables = _.toArray(selectedDefinition.getDeliverablesForDefinition());

                    vm.gauge1.updateGaugeValue(chartService.getSatisfactionRating(vm.visibleDeliverables));
                    vm.gauge2.updateGaugeValue(chartService.getOnTimeDeliveryRating(vm.visibleDeliverables));

                    vm.deliverableGrid.data = vm.visibleDeliverables;

                    vm.gotData = true;

                });
            }

        }
        dropdownLabel(deliverableDefinition) {
            var deliverables = deliverableDefinition.getDeliverablesForDefinition();
            return deliverableDefinition.title + ' (' + _.toArray(deliverables).length + ')';
        }

        getUpdateState() {
            vm.$state.go('deliverables.instances', {fy: vm.fiscalYear, id: vm.selectedDefinition.id});
        }

        nextFiscalYear() {
            var updatedFiscalYear = vm.fiscalYear + 1;
            vm.$state.go('deliverables.instances', {fy: updatedFiscalYear, id: null});
        }

        priorFiscalYear() {
            var updatedFiscalYear = vm.fiscalYear - 1;
            vm.$state.go('deliverables.instances', {fy: updatedFiscalYear, id: null});
        }
    }

    angular
        .module('pmam-deliverables')
        .controller('deliverableInstancesController', DeliverableInstancesController);

}