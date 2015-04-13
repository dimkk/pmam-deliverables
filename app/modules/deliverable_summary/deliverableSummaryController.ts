/// <reference path="../../../typings/app.d.ts" />
module app {
    'use strict';

    class DeliverableSummaryController{
        summary21;
        summary23;
        constructor($q, deliverablesModel:DeliverablesModel,
                    deliverableDefinitionsModel:DeliverableDefinitionsModel,
                    deliverablesService:DeliverablesService,
                    fiscalYear:number) {
            var vm = this;

            activate();


            /**==================PRIVATE==================*/

            function activate() {
                $q.all([
                    deliverablesModel.getFyDeliverables(fiscalYear),
                    deliverableDefinitionsModel.getDeliverableDefinitionsByTaskNumber(fiscalYear, '2.1'),
                    deliverableDefinitionsModel.getDeliverableDefinitionsByTaskNumber(fiscalYear, '2.3')
                ]).then(function (resolvedPromises) {
                    var deliverables = resolvedPromises[0];
                    var definitions21 = resolvedPromises[1];
                    var definitions23 = resolvedPromises[2];

                    vm.summary21 = deliverablesService.createDeliverableSummaryObject(definitions21);
                    vm.summary23 = deliverablesService.createDeliverableSummaryObject(definitions23);
                    console.log(vm.summary21);

                });


                //deliverablesService.getGroupedFyDeliverablesByTaskNumber(fiscalYear)
                //    .then(function (groupedDeliverablesByTaskNumber) {
                //        console.log(groupedDeliverablesByTaskNumber);
                //        vm.groupedDeliverablesByTaskNumber = groupedDeliverablesByTaskNumber;
                //    })


            }
        }
    }


    angular
        .module('pmam-deliverables')
        .controller('deliverableSummaryController', DeliverableSummaryController);

}
