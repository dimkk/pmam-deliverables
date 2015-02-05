(function () {
    'use strict';

    // controller returning deliverable types

    angular
        .module('pmam-deliverables')
        .controller('definitionsController', definitionsController);

    /* @ngInject */
    function definitionsController($state, deliverableDefinitionsModel, calendarService) {

        var vm = this;

        vm.fiscalYear = isNaN($state.params.fy) ? calendarService.getCurrentFiscalYear() : parseInt($state.params.fy);
        vm.searchString = '';

        activate();


        /**==================PRIVATE==================*/

        function activate() {

            deliverableDefinitionsModel.getFyDefinitions(vm.fy)
                .then(function (indexedCache) {
                    vm.deliverableDefinitions = indexedCache
                })
        }
    }
})();
