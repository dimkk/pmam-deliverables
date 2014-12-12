(function () {
    'use strict';

    angular
        .module('pmam-deliverables')
        .controller('newDeliverableFormController', newDeliverableFormController);

    /* @ngInject */
    function newDeliverableFormController($state, $scope, deliverableDefinitionsModel, deliverablesModel, userService) {

        activate();

        /**==================PRIVATE==================*/

        function activate() {

            var fiscalYear = moment().format('YYYY');
            var currentMonth = moment().format('MM');

            if(currentMonth > 8) {
                fiscalYear++;
            }

            $scope.state = {dataReady:false};
            $scope.deliverableRecord = deliverablesModel.createEmptyItem({fy:fiscalYear});
            $scope.deliverableRecord.month = currentMonth;

            getDeliverableTypes().then(function(){
                if($state.params.deliverableTypeId) {
                    var selectedDeliverableType = _.find($scope.deliverableTypes,{id:parseInt($state.params.deliverableTypeId)})
                    if(selectedDeliverableType){
                        $scope.deliverableRecord.deliverableType = {lookupId:selectedDeliverableType.id,lookupValue:selectedDeliverableType.title};
                    }
                }
            });

            userService.getUserLookupValues()
                .then(function (result) {
                    $scope.personnelArray = result;
                    $scope.state.dataReady = true;
                }),
                function(err) {
                    console.log(err);
                }
        }

        function getDeliverableTypes() {

            return deliverableDefinitionsModel.getFyDefinitions($scope.deliverableRecord.fy).then(function(indexedCache){

                $scope.deliverableTypes = indexedCache.toArray();
            });

        }

        function save() {
            $scope.deliverableRecord.saveChanges().then(function() {
                toastr.success("Deliverable updated");
                $state.go('deliverables.instances',{id:$scope.deliverableRecord.deliverableType.lookupId,fy:$scope.deliverableRecord.fy});
            }, function () {
                toastr.error("There was a problem updating this deliverable record");
            });
        }

    }
})();
