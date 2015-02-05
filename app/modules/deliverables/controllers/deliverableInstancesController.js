(function () {
    'use strict';

    // deliverables instances controller

    angular
        .module('pmam-deliverables')
        .controller('deliverableInstancesController', deliverableInstancesController);

    /* @ngInject */
    function deliverableInstancesController($q, deliverableFeedbackModel, chartService, $scope, deliverablesModel,
                                            $state, deliverablesService, fyDefinitions, selectedDefinition, fy) {

        var vm = this;
        /** Stop Everything if a valid definition isn't available */
        if(!selectedDefinition) {
            return null;
        }
        vm.deliverableFrequency = selectedDefinition.frequency.lookupValue;
        vm.fyDefinitions = fyDefinitions;
        vm.selectedDefinition = selectedDefinition;
        vm.getUpdateState = getUpdateState;
        vm.gotData = false;
        vm.rightPanelView = 'modules/deliverables/views/deliverableMetricsView.html';
        vm.showFeedback = false;
        vm.toggleRightPanel = toggleRightPanel;
        vm.dropdownLabel = dropdownLabel;

        activate();

        /**==================PRIVATE==================*/

        function activate() {

            $q.all([
                deliverableFeedbackModel.getFyFeedback(fy),
                deliverablesService.getDeliverablesByType(fy, selectedDefinition.id)
            ])
                .then(function (resolvedPromises) {
                    vm.deliverableFeedback = resolvedPromises[0];
                    vm.deliverableInstances = resolvedPromises[1];
                    initializeMetricsGauges();
                });
        }

        function getUpdateState() {
            $state.go('deliverables.instances', {fy: fy, id: vm.selectedDefinition.id});
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

    }
})();
