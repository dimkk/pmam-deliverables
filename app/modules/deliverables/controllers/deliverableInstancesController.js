(function () {
    'use strict';

    angular
        .module('pmam-deliverables')
        .controller('deliverableInstancesController', deliverableInstancesController);

    /* @ngInject */
    function deliverableInstancesController($scope, $location, $state, _, deliverablesService, deliverableDefinitionsModel) {

        var fy = $state.params.fy || '2013';
        var activeId = $state.params.id;

        $scope.state = {selectedDeliverable: null};
        $scope.getUpdateState = getUpdateState;

        $scope.gotData = false;

        activate();


        /**==================PRIVATE==================*/

        function activate() {

            deliverableDefinitionsModel.getFyDefinitions(fy).then(function(indexedCache){

                if(!activeId){
                    $scope.state.selectedDeliverable = indexedCache.first();
                    deliverablesService.getDeliverablesByType(fy,parseInt($scope.state.selectedDeliverable.id)).then(function(indexedCached){
                        $scope.deliverableInstances = indexedCached;
                    })
                } else {

                    $scope.state.selectedDeliverable = indexedCache[ parseInt(activeId) ];
                }
                $scope.frequency = $scope.state.selectedDeliverable.frequency.lookupValue;
                $scope.deliverableDefinitions = indexedCache.toArray();

                if(activeId) {
                    deliverablesService.getDeliverablesByType(fy,parseInt(activeId)).then(function(indexedCached){
                        $scope.deliverableInstances = indexedCached;
                    })
                }
            });


        }

        function getUpdateState(){
            $state.go('deliverables.instances',{ fy: fy, id: $scope.state.selectedDeliverable.id } )
        }


    }
})();
