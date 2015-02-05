(function () {
    'use strict';

    // controller returning deliverable types

    angular
        .module('pmam-deliverables')
        .controller('definitionsController', definitionsController);

    /* @ngInject */
    function definitionsController($state, $q, _, deliverableDefinitionsModel, deliverablesModel, calendarService) {

        var vm = this;

        vm.deliverableCountByDefinition = deliverableCountByDefinition;
        vm.fiscalYear = isNaN($state.params.fy) ? calendarService.getCurrentFiscalYear() : parseInt($state.params.fy);
        vm.searchString = '';

        activate();

        /**==================PRIVATE==================*/

        function activate() {

            $q.all([deliverableDefinitionsModel.getFyDefinitions(vm.fy), deliverablesModel.getFyDeliverables(vm.fy)])
                .then(function (resolvedPromises) {
                    vm.deliverableDefinitions = resolvedPromises[0];
                });
        }

        function deliverableCountByDefinition(definition) {
            var deliverableInstances = definition.getDeliverablesForDefinition();
            return _.toArray(deliverableInstances).length;
        }

    }
})();
