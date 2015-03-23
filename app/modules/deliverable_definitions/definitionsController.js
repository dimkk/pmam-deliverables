(function () {
    'use strict';

    // controller returning deliverable types

    angular
        .module('pmam-deliverables')
        .controller('definitionsController', definitionsController);

    /* @ngInject */
    function definitionsController($state, $q, _, deliverableDefinitionsModel, deliverablesModel, fiscalYear) {

        var vm = this;

        vm.deliverableCountByDefinition = deliverableCountByDefinition;
        vm.fiscalYear = fiscalYear;
        vm.fiscalYearDisplay = 'FY ' + vm.fiscalYear.toString().slice(-2);
        vm.searchString = '';
        vm.nextFiscalYear = nextFiscalYear;
        vm.priorFiscalYear = priorFiscalYear;

        activate();

        /**==================PRIVATE==================*/

        function activate() {

            $q.all([deliverableDefinitionsModel.getFyDefinitions(vm.fiscalYear), deliverablesModel.getFyDeliverables(vm.fiscalYear)])
                .then(function (resolvedPromises) {
                    vm.deliverableDefinitions = resolvedPromises[0];
                });
        }

        function deliverableCountByDefinition(definition) {
            var deliverableInstances = definition.getDeliverablesForDefinition();
            return _.toArray(deliverableInstances).length;
        }

        function nextFiscalYear() {
            var updatedFiscalYear = vm.fiscalYear + 1;
            $state.go('deliverables.types', {fy: updatedFiscalYear});

        }

        function priorFiscalYear() {
            var updatedFiscalYear = vm.fiscalYear - 1;
            $state.go('deliverables.types', {fy: updatedFiscalYear});
        }

    }
})();
