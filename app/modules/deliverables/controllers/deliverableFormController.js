(function () {
    'use strict';

    // controller handling updates to existing deliverables

    angular
        .module('pmam-deliverables')
        .controller('deliverableFormController', deliverableFormController);


    /* @ngInject */
    function deliverableFormController(deliverableFeedbackModel, toastr, $state, deliverableDefinitionsModel,
                                       userService, $q, deliverableRecord) {

        var vm = this;
        vm.cancel = cancel;
        vm.dataReady = false;
        vm.deleteRecord = deleteRecord;
        vm.deliverableRecord = deliverableRecord;
        vm.hoveringOver = hoveringOver;
        vm.isActiveTab = isActiveTab;
        vm.save = save;
        vm.setTab = setTab;
        vm.updateFeedback = updateFeedback;

        // rating settings
        vm.rate = 5;
        vm.max = 5;
        vm.isReadonly = false;
        vm.showCommentInput = false;


        vm.tabs = [{
            title: 'Main',
            url: 'modules/deliverables/views/deliverableFormView.html'
        }, {
            title: 'Comments',
            url: 'modules/deliverables/views/deliverableCommentsView.html'
        }];

        //TODO This should reference an object in the above array, shouldn't have the file ref twice
        vm.currentTab = 'modules/deliverables/views/deliverableFormView.html';

        activate();


        /**==================PRIVATE==================*/

        function activate() {

            if(!deliverableRecord) {
                /** Redirect if a valid deliverable isn't found */
                toastr.error('No requested deliverable wasn\'t found.');
                return $state.go('deliverables.main');
            }

            var calendarMonth;

            $q.all([
                userService.getUserLookupValues(),
                deliverableFeedbackModel.executeQuery(),
                deliverableDefinitionsModel.getFyDefinitions(deliverableRecord.fy)
            ]).then(function(resolvedPromises) {
                vm.personnelArray = resolvedPromises[0];
                vm.deliverableTypes = resolvedPromises[2].toArray();

                //TODO Need to create a method that gets deliverable by fy so we can cache instead of calling new each time
                // get a list of all existing feedback on this deliverable
                vm.deliverableFeedback = deliverableRecord.getCachedFeedbackByDeliverableId();

                // get feedback for just the current user
                vm.userDeliverableFeedback = deliverableRecord.getCachedFeedbackForCurrentUser();

                // if a comment already exists for the user, show the comments textarea
                if (vm.userDeliverableFeedback.comments.length) {
                    vm.showCommentInput = true;
                }

                // convert fiscal year month to calendar month
                calendarMonth = deliverableRecord.getCalendarMonth();

                vm.dataReady = true;
            });


        }

        function isActiveTab(tabUrl) {
            return tabUrl == vm.currentTab;
        }

        function setTab(tab) {
            vm.currentTab = tab.url;
        }

        function updateFeedback() {
            vm.userDeliverableFeedback.saveChanges().then(function () {
                toastr.success("Feedback updated");
            });
            vm.showCommentInput = true;
        }

        function hoveringOver(value) {
            vm.overStar = value;
            vm.percent = 100 * (value / vm.max);
        }


        function save() {
            deliverableRecord.saveChanges().then(function () {

                if (vm.userDeliverableFeedback.comments.length) {

                    vm.updateFeedback();

                }

                toastr.success("Deliverable updated");
                $state.go('deliverables.instances', {
                    id: deliverableRecord.deliverableType.lookupId,
                    fy: deliverableRecord.fy
                });
            }, function () {
                toastr.error("There was a problem updating this deliverable record");
            });

        }

        function deleteRecord() {

            var confirmation = window.confirm('Are you sure you want to delete this deliverable?');
            if(confirmation) {
                var deliverableTypeId = deliverableRecord.deliverableType.lookupId;
                var deliverableFiscalYear = deliverableRecord.fy;

                deliverableRecord.deleteItem().then(function () {
                    toastr.success("Deliverable successfully deleted");
                    $state.go('deliverables.instances', {id: deliverableTypeId, fy: deliverableFiscalYear});
                }, function () {
                    toastr.error("There was a problem deleting this deliverable record");
                });
            }
        }

        function cancel() {
            $state.go('deliverables.instances', {
                id: deliverableRecord.deliverableType.lookupId,
                fy: deliverableRecord.fy
            });
        }


    }
})();
