(function () {
    'use strict';

    // controller for handling new deliverable creation requests

    angular
        .module('pmam-deliverables')
        .controller('newDeliverableFormController', newDeliverableFormController);

    /* @ngInject */
    function newDeliverableFormController(toastr, $state, deliverableDefinitionsModel, deliverablesModel, userService) {

        var vm = this;

        activate();

        /**==================PRIVATE==================*/

        function activate() {

            var fiscalYear = moment().format('YYYY');
            var currentMonth = moment().format('MM');

            // correct for fiscal year
            currentMonth = parseInt(currentMonth) + 3;

            if (currentMonth > 12) {
                currentMonth = currentMonth - 12;
            }

            if(currentMonth > 8) {
                fiscalYear++;
            }

            vm.state = {dataReady: false};
            vm.deliverableRecord = deliverablesModel.createEmptyItem({fy: fiscalYear});
            vm.deliverableRecord.month = parseInt(currentMonth) + 3;
            vm.cancel = cancel;
            vm.save = save;

            getDeliverableTypes().then(function(){
                if($state.params.deliverableTypeId) {
                    var selectedDeliverableType = _.find(vm.deliverableTypes, {id: parseInt($state.params.deliverableTypeId)})
                    if(selectedDeliverableType){
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
                    vm.state.dataReady = true;
                }),
                function(err) {
                    console.log(err);
                }
        }

        function getDeliverableTypes() {

            return deliverableDefinitionsModel.getFyDefinitions(vm.deliverableRecord.fy).then(function (indexedCache) {

                vm.deliverableTypes = indexedCache.toArray();
            });

        }

        function save() {
            vm.deliverableRecord.saveChanges().then(function () {
                toastr.success("Deliverable updated");
                $state.go('deliverable', {id: vm.deliverableRecord.deliverableType.lookupId});
            }, function () {
                toastr.error("There was a problem updating this deliverable record");
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
