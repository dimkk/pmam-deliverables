(function () {
    'use strict';

    // controller for handling new deliverable creation requests

    angular
        .module('pmam-deliverables')
        .controller('newDeliverableFormController', newDeliverableFormController);

    /* @ngInject */
    function newDeliverableFormController(toastr, $state, $scope, deliverableDefinitionsModel, deliverablesModel, userService) {

        var vm = this;

        activate();

        /**==================PRIVATE==================*/

        function activate() {

            var fiscalYear = moment().format('YYYY');
            var currentMonth = moment().format('MM');

            if(currentMonth > 8) {
                fiscalYear++;
            }

            $scope.state = {dataReady:false};
            vm.deliverableRecord = deliverablesModel.createEmptyItem({fy: fiscalYear});
            vm.deliverableRecord.month = currentMonth;
            $scope.cancel = cancel;
            $scope.save = save;

            getDeliverableTypes().then(function(){
                if($state.params.deliverableTypeId) {
                    var selectedDeliverableType = _.find($scope.deliverableTypes,{id:parseInt($state.params.deliverableTypeId)})
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
                    $scope.state.dataReady = true;
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
