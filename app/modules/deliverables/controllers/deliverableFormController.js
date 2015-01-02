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
            var calendarMonth;
            var deliverableRecord = deliverablesModel.getCachedEntity(parseInt(deliverableId));

            var requestQueue = [userService.getUserLookupValues()];

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

                // convert fiscal year month to calendar month
                calendarMonth = $scope.deliverableRecord.month - 3;
                if(calendarMonth <= 0) {
                    calendarMonth = calendarMonth + 12;
                }
                $scope.deliverableRecord.month = calendarMonth.toString();

                $scope.state.dataReady = true;
            });

            // rating settings
            $scope.rate = 5;
            $scope.max = 5;
            $scope.isReadonly = false;

            $scope.hoveringOver = function (value) {
                $scope.overStar = value;
                $scope.percent = 100 * (value / $scope.max);
            };

            $scope.ratingStates = [
                {stateOn: 'glyphicon-ok-sign', stateOff: 'glyphicon-ok-circle'},
                {stateOn: 'glyphicon-star', stateOff: 'glyphicon-star-empty'},
                {stateOn: 'glyphicon-heart', stateOff: 'glyphicon-ban-circle'},
                {stateOn: 'glyphicon-heart'},
                {stateOff: 'glyphicon-off'}
            ];

            $scope.$watch('rate', function (val) {

                function success(data) {

                    console.log(data);

                };

                function error(response) {

                    console.log(response)

                    alert("Can't post " + response.data + " Error:" + response.status);

                }


                if (val) {

                    var data = {
                        rating: val,
                        user: "userId" // I'm not sure where is your userId

                    }

                    // here we can update the data source with the rating but then what about the optional comment?
                    console.log("post this: " + val);
                    // $http.post("yourUrl", data).then(success, error);


                }
            })

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
