(function () {
    'use strict';

    // deliverables instances controller

    angular
        .module('pmam-deliverables')
        .controller('deliverableInstancesController', deliverableInstancesController);

    /* @ngInject */
    function deliverableInstancesController($state, $q, deliverableFeedbackModel, deliverablesModel, chartService,
                                            fyDefinitions, selectedDefinition, fiscalYear) {

        var vm = this;
        /** Stop Everything if a valid definition isn't available */
        if(!selectedDefinition) {
            return null;
        }
        vm.deliverableFrequency = selectedDefinition.frequency.lookupValue;
        vm.fiscalYearDisplay = 'FY ' + fiscalYear.toString().slice(-2);
        vm.fyDefinitions = fyDefinitions;
        vm.selectedDefinition = selectedDefinition;
        vm.getUpdateState = getUpdateState;
        vm.gotData = false;
        vm.rightPanelView = 'modules/deliverables/views/deliverableMetricsView.html';
        vm.showFeedback = false;
        vm.toggleRightPanel = toggleRightPanel;
        vm.dropdownLabel = dropdownLabel;
        vm.nextFiscalYear = nextFiscalYear;
        vm.priorFiscalYear = priorFiscalYear;

        activate();

        /**==================PRIVATE==================*/

        function activate() {

            deliverablesModel.getFyDeliverables(fiscalYear)
                .then(function (indexedCache) {
                    vm.deliverableInstances = selectedDefinition.getDeliverablesForDefinition();
                    vm.gotData = true;

                });

            deliverableFeedbackModel.getFyFeedback(fiscalYear)
                .then(function (indexedCache) {
                    initializeMetricsGauges();
                });
        }

        function getUpdateState() {
            $state.go('deliverables.instances', {fy: fiscalYear, id: vm.selectedDefinition.id});
        }

        function toggleRightPanel() {
            vm.rightPanelView = 'modules/deliverables/views/deliverableMetricsView.html';
        }

        function dropdownLabel(deliverableDefinition) {
            var deliverables = deliverableDefinition.getDeliverablesForDefinition();
            return deliverableDefinition.title + ' (' + _.toArray(deliverables).length + ')';
        }

        function initializeMetricsGauges() {

            vm.gauge1 = new chartService.Gauge('Satisfaction');
            vm.gauge2 = new chartService.Gauge('OTD');

            //TODO Add logic so we don't need to fake gauge values
            vm.gauge1.updateGaugeValue(chartService.getRandom());
            vm.gauge2.updateGaugeValue(chartService.getRandom());
        }

        function nextFiscalYear() {
            var updatedFiscalYear = fiscalYear + 1;
            $state.go('deliverables.instances', {fy: updatedFiscalYear});

        }

        function priorFiscalYear() {
            var updatedFiscalYear = fiscalYear - 1;
            $state.go('deliverables.instances', {fy: updatedFiscalYear});
        }


    }
})();
