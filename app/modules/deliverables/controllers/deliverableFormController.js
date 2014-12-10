(function () {
    'use strict';

    angular
        .module('pmam-deliverables')
        .controller('deliverableFormController', deliverableFormController);

    /* @ngInject */
    function deliverableFormController(toastr, _, $state, $scope, deliverablesModel, deliverableDefinitionsModel, userService, $q ) {

        $scope.state = {dataReady:false};
        $scope.save = save;
        $scope.deleteRecord = deleteRecord;
        $scope.cancel = cancel;

        activate();


        /**==================PRIVATE==================*/

        function activate() {

            var deliverableId = $state.params.id;

            var deliverableRecord = deliverablesModel.getCachedEntity(parseInt(deliverableId));

            var requestQueue = [userService.getUsers()];

            if( !deliverableRecord ) {
                requestQueue.push(deliverablesModel.getListItemById(parseInt(deliverableId)));
            }

            $q.all(requestQueue).then(function(resolvedPromises) {
                $scope.personnelArray = resolvedPromises[0];

                if(!deliverableRecord){

                    if(resolvedPromises[1]) {
                        $scope.deliverableRecord = resolvedPromises[1];
                        getDeliverableTypes();
                    } else {
                        console.log('no record found!');
                    }

                } else {
                    $scope.deliverableRecord = deliverableRecord;
                    getDeliverableTypes();
                }

                $scope.state.dataReady = true;
            });

        }

        function getDeliverableTypes() {

            deliverableDefinitionsModel.getFyDefinitions($scope.deliverableRecord.fy).then(function(indexedCache){
                $scope.deliverableTypes = indexedCache.toArray();
            });

        }

        function save() {
            $scope.deliverableRecord.saveChanges().then(function() {
                toastr.success("Deliverable updated");
                $state.go('deliverables.instances',{ id:$scope.deliverableRecord.deliverableType.lookupId, fy:$scope.deliverableRecord.fy});
            }, function () {
                toastr.error("There was a problem updating this deliverable record");
            });
        }

        function deleteRecord() {

            var confirmation = window.confirm('Are you sure you want to delete this deliverable?');
            if(confirmation) {
                var deliverableTypeId = $scope.deliverableRecord.deliverableType.lookupId;
                var deliverableFiscalYear = $scope.deliverableRecord.fy;

                $scope.deliverableRecord.deleteItem().then(function () {
                    toastr.success("Deliverable successfully deleted");
                    $state.go('deliverables.instances', {id: deliverableTypeId, fy: deliverableFiscalYear});
                }, function () {
                    toastr.error("There was a problem deleting this deliverable record");
                });
            }
        }

        function cancel() {
            $state.go('deliverables.instances',{ id:$scope.deliverableRecord.deliverableType.lookupId, fy:$scope.deliverableRecord.fy});
        }


    }
})();
