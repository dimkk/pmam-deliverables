(function () {
    'use strict';

    // controller handling updates to existing deliverables

    angular
        .module('pmam-deliverables')
        .controller('deliverableFormController', deliverableFormController);


    /* @ngInject */
    function deliverableFormController(deliverableFeedbackModel, toastr, _, $state, $scope, deliverablesModel, deliverableDefinitionsModel, userService, $q) {

        var vm = this;

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

            var requestQueue = [userService.getUserLookupValues(), deliverableFeedbackModel.executeQuery()];

            if( !deliverableRecord ) {
                requestQueue.push(deliverablesModel.getListItemById(parseInt(deliverableId)));

            }

            $q.all(requestQueue).then(function(resolvedPromises) {
                vm.personnelArray = resolvedPromises[0];

                if(!deliverableRecord){

                    if (resolvedPromises[2]) {
                        vm.deliverableRecord = resolvedPromises[2];
                        getDeliverableTypes();
                    } else {
                        console.log('no record found!');
                    }

                } else {
                    vm.deliverableRecord = deliverableRecord;
                    getDeliverableTypes();
                }

                // get a list of all existing feedback on this deliverable
                vm.deliverableFeedback = vm.deliverableRecord.getCachedFeedbackByDeliverableId();

                // get feedback for just the current user
                vm.userDeliverableFeedback = vm.deliverableRecord.getCachedFeedbackForCurrentUser();

                // if a comment already exists for the user, show the comments textarea
                if (vm.userDeliverableFeedback.comments.length) {
                    vm.showCommentInput = true;
                }

                // convert fiscal year month to calendar month
                calendarMonth = vm.deliverableRecord.month - 3;
                if(calendarMonth <= 0) {
                    calendarMonth = calendarMonth + 12;
                }
                $scope.state.dataReady = true;
            });

            // rating settings
            vm.rate = 5;
            vm.max = 5;
            vm.isReadonly = false;
            vm.showCommentInput = false;

            vm.hoveringOver = function (value) {
                vm.overStar = value;
                vm.percent = 100 * (value / vm.max);
            };

            $scope.ratingStates = [
                {stateOn: 'glyphicon-ok-sign', stateOff: 'glyphicon-ok-circle'},
                {stateOn: 'glyphicon-star', stateOff: 'glyphicon-star-empty'},
                {stateOn: 'glyphicon-heart', stateOff: 'glyphicon-ban-circle'},
                {stateOn: 'glyphicon-heart'},
                {stateOff: 'glyphicon-off'}
            ];

        }

        vm.updateFeedback = function () {

            vm.userDeliverableFeedback.saveChanges().then(function () {
                toastr.success("Feedback updated");
            });
            vm.showCommentInput = true;
        }

        function getDeliverableTypes() {

            deliverableDefinitionsModel.getFyDefinitions(vm.deliverableRecord.fy).then(function (indexedCache) {
                vm.deliverableTypes = indexedCache.toArray();
            });

        }

        function save() {
            vm.deliverableRecord.saveChanges().then(function () {

                if (vm.userDeliverableFeedback.comments.length) {

                    vm.updateFeedback();

                }

                toastr.success("Deliverable updated");
                $state.go('deliverables.instances', {
                    id: vm.deliverableRecord.deliverableType.lookupId,
                    fy: vm.deliverableRecord.fy
                });
            }, function () {
                toastr.error("There was a problem updating this deliverable record");
            });

        }

        function deleteRecord() {

            var confirmation = window.confirm('Are you sure you want to delete this deliverable?');
            if(confirmation) {
                var deliverableTypeId = vm.deliverableRecord.deliverableType.lookupId;
                var deliverableFiscalYear = vm.deliverableRecord.fy;

                vm.deliverableRecord.deleteItem().then(function () {
                    toastr.success("Deliverable successfully deleted");
                    $state.go('deliverables.instances', {id: deliverableTypeId, fy: deliverableFiscalYear});
                }, function () {
                    toastr.error("There was a problem deleting this deliverable record");
                });
            }
        }

        function cancel() {
            $state.go('deliverables.instances', {
                id: vm.deliverableRecord.deliverableType.lookupId,
                fy: vm.deliverableRecord.fy
            });
        }


    }
})();
