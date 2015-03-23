(function () {
    'use strict';

    angular
        .module('pmam-deliverables')
        .controller('deliverableSummaryController', deliverableSummaryController);

    /* @ngInject */
    function deliverableSummaryController($q, deliverablesModel, deliverableDefinitionsModel, deliverablesService,
                                          fiscalYear) {
        var vm = this;

        activate();


        /**==================PRIVATE==================*/

        function activate() {
            $q.all([
                deliverablesModel.getFyDeliverables(fiscalYear),
                deliverableDefinitionsModel.getFyDefinitions(fiscalYear)
            ]).then(function (resolvedPromises) {
                var deliverables = resolvedPromises[0];
                var definitions = resolvedPromises[1];

                vm.fySummary = deliverablesService.createDeliverableSummaryObject(definitions);
                console.log(vm.fySummary);

            });


            //deliverablesService.getGroupedFyDeliverablesByTaskNumber(fiscalYear)
            //    .then(function (groupedDeliverablesByTaskNumber) {
            //        console.log(groupedDeliverablesByTaskNumber);
            //        vm.groupedDeliverablesByTaskNumber = groupedDeliverablesByTaskNumber;
            //    })


        }
    }
})();
