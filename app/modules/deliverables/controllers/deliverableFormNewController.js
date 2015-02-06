(function () {
    'use strict';

    // controller for handling new deliverable creation requests

    angular
        .module('pmam-deliverables')
        .controller('deliverableFormNewController', deliverableFormNewController);

    /* @ngInject */
    function deliverableFormNewController(toastr, $state, deliverableDefinitionsModel, deliverablesModel,
                                          userService, calendarService) {

        var vm = this;

        var fiscalYear = isNaN($state.params.fy) ? calendarService.getCurrentFiscalYear() : parseInt($state.params.fy);
        var fiscalMonth = isNaN($state.params.mo) ? calendarService.getCurrentFiscalMonth() : parseInt($state.params.mo);

        vm.dataReady = false;
        vm.deliverableRecord = deliverablesModel.createEmptyItem({fy: fiscalYear});
        vm.deliverableRecord.fiscalMonth = parseInt(fiscalMonth);
        vm.cancel = cancel;
        vm.save = save;

        activate();

        /**==================PRIVATE==================*/

        function activate() {

            deliverableDefinitionsModel.getFyDefinitions(vm.deliverableRecord.fy)
                .then(function (indexedCache) {
                    vm.deliverableTypes = indexedCache.toArray();
                    /** Check to see if a deliverable type was identified */
                    if ($state.params.deliverableTypeId) {
                        var selectedDeliverableType = indexedCache[parseInt($state.params.deliverableTypeId)];
                        if (selectedDeliverableType) {
                            vm.deliverableRecord.deliverableType = {
                                lookupId: selectedDeliverableType.id,
                                lookupValue: selectedDeliverableType.title
                            };
                        }
                    }
                });

            userService.getUserLookupValues()
                .then(function (result) {
                    vm.personnelArray = result;
                    vm.dataReady = true;
                });
        }

        function save() {
            vm.deliverableRecord.saveChanges()
                .then(function (newDeliverable) {
                    toastr.success("Deliverable updated");
                    $state.go('deliverable', {id: newDeliverable.id});
            }, function () {
                toastr.error("There was a problem creating this deliverable record");
            });
        }

        function cancel() {
            $state.go('deliverables.instances', {
                id: vm.deliverableRecord.deliverableType.lookupId,
                fy: vm.deliverableRecord.fy
            });
        }

    }
})();
