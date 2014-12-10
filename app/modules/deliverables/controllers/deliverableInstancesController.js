(function () {
    'use strict';

    angular
        .module('pmam-deliverables')
        .controller('deliverableInstancesController', deliverableInstancesController);

    /* @ngInject */
    function deliverableInstancesController($scope, $location, $state, _, deliverablesService, deliverableDefinitionsModel) {

        var fy = $state.params.fy || '2013';
        var activeId = $state.params.id;

        $scope.random = {selectedDeliverable: null};
        $scope.getUpdateRandom = getUpdateRandom;

        $scope.gotData = false;

        activate();


        /**==================PRIVATE==================*/

        function activate() {

            deliverableDefinitionsModel.getFyDefinitions(fy).then(function(indexedCache){

                if(!activeId){
                    $scope.random.selectedDeliverable = indexedCache.first();
                } else {
                    $scope.random.selectedDeliverable = indexedCache[ parseInt(activeId) ];
                    $scope.frequency = $scope.random.selectedDeliverable.frequency.lookupValue;

                }

                $scope.deliverableDefinitions = indexedCache.toArray();

                deliverablesService.getDeliverablesByType(fy,parseInt(activeId)).then(function(indexedCached){
                    $scope.deliverableInstances = indexedCached;
                })
            });


        }

        function getUpdateRandom(){
            $state.go('deliverables.instances',{ fy: fy, id: $scope.random.selectedDeliverable.id } )
        }


    }
})();
