(function () {
    'use strict';

    angular
        .module('pmam-deliverables')
        .controller('newDeliverableFormController', newDeliverableFormController);

    /* @ngInject */
    function newDeliverableFormController($state, $scope, deliverableDefinitionsModel, deliverablesModel) {


        activate();


        /**==================PRIVATE==================*/

        function activate() {

            var fy = $state.params.fy || '2013';
            var currentMonth = $state.params.mo || '11';

            $scope.deliverableRecord = deliverablesModel.createEmptyItem({fy:fy});
            $scope.deliverableRecord.month = currentMonth;

            getDeliverableTypes().then(function(){
                if($state.params.deliverableTypeId) {
                    var selectedDeliverableType = _.find($scope.deliverableTypes,{id:parseInt($state.params.deliverableTypeId)})
                    if(selectedDeliverableType){
                        $scope.deliverableRecord.deliverableType = {lookupId:selectedDeliverableType.id,lookupValue:selectedDeliverableType.title};
                    }
                }
            });

            $scope.$watch('deliverableRecord.deliverableType',function(newVal,oldVal){
                if(newVal && newVal !== oldVal) {
                    // do something
                }
            })

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
