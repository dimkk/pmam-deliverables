(function () {
    'use strict';

    // deliverables instances controller

    angular
        .module('pmam-deliverables')
        .controller('deliverableInstancesController', deliverableInstancesController);

    /* @ngInject */
    function deliverableInstancesController($state, $q, deliverableFeedbackModel, deliverablesModel, chartService,
                                            fyDefinitions, selectedDefinition, fiscalYear, deliverableAccessLogModel) {

        var vm = this;

        vm.fiscalYearDisplay = 'FY ' + fiscalYear.toString().slice(-2);
        vm.fyDefinitions = fyDefinitions;
        vm.selectedDefinition = selectedDefinition;
        vm.getUpdateState = getUpdateState;
        vm.gotData = false;
        vm.showFeedback = false;
        vm.dropdownLabel = dropdownLabel;
        vm.nextFiscalYear = nextFiscalYear;
        vm.priorFiscalYear = priorFiscalYear;

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

                vm.gotData = true;

            });
        }

        function getUpdateState() {
            $state.go('deliverables.instances', {fy: fiscalYear, id: vm.selectedDefinition.id});
        }

        function dropdownLabel(deliverableDefinition) {
            var deliverables = deliverableDefinition.getDeliverablesForDefinition();
            return deliverableDefinition.title + ' (' + _.toArray(deliverables).length + ')';
        }

        function nextFiscalYear() {
            var updatedFiscalYear = fiscalYear + 1;
            $state.go('deliverables.instances', {fy: updatedFiscalYear, id: null});

        }

        function priorFiscalYear() {
            var updatedFiscalYear = fiscalYear - 1;
            $state.go('deliverables.instances', {fy: updatedFiscalYear, id: null});
        }

    }
})();
