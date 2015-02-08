(function () {
    'use strict';

    // controller handling updates to existing deliverables
    angular
        .module('pmam-deliverables')
        .controller('deliverableFormEditController', deliverableFormEditController);

    /* @ngInject */
    function deliverableFormEditController(deliverableFeedbackModel, toastr, $state, deliverableDefinitionsModel,
                                       userService, $q, deliverableRecord, ratingsService, calendarService) {

        //TODO Need to add logic to revert back to pristine deliverable in cache if entity is updated and user leaves without saving
        var vm = this;
        vm.activeTab = 'main'; //2 tabs are ['main', 'discussion']
        vm.cancel = cancel;
        vm.dataReady = false;
        vm.deleteMyFeedback = deleteMyFeedback;
        vm.deleteRecord = deleteRecord;
        vm.deliverableRecord = deliverableRecord;
        vm.discussionBadgeValue = discussionBadgeValue;
        vm.getLabelClass = ratingsService.getLabelClass;
        vm.hoveringOver = hoveringOver;
        vm.monthOptions = calendarService.getMonthOptions();
        vm.save = save;
        vm.starClass = ratingsService.starClass;
        vm.updateFeedback = updateFeedback;

        // rating settings
        vm.rate = 5;
        vm.max = 5;
        vm.isReadonly = false;

        activate();

        /**==================PRIVATE==================*/

        function activate() {

            if (!deliverableRecord) {
                /** Redirect if a valid deliverable isn't found */
                toastr.error('No requested deliverable wasn\'t found.');
                return $state.go('deliverables.main');
            }

            $q.all([
                userService.getUserLookupValues(),
                deliverableFeedbackModel.getFyFeedback(deliverableRecord.fy),
                deliverableDefinitionsModel.getFyDefinitions(deliverableRecord.fy)
            ]).then(function (resolvedPromises) {
                vm.personnelArray = resolvedPromises[0];
                vm.deliverableTypes = resolvedPromises[2];

                // get all feedback for this deliverable
                vm.deliverableFeedback = deliverableRecord.getCachedFeedbackByDeliverableId();

                // get feedback for just the current user for this deliverable
                vm.userDeliverableFeedback = deliverableRecord.getCachedFeedbackForCurrentUser();

                vm.dataReady = true;
            });
        }

        function updateFeedback() {
            vm.userDeliverableFeedback.saveChanges()
                .then(function (updatedFeedback) {
                    toastr.success("Feedback updated");
                    /** Ensure feedback reference is updated */
                    vm.userDeliverableFeedback = updatedFeedback;
                });
        }

        function hoveringOver(value) {
            vm.overStar = value;
            vm.percent = 100 * (value / vm.max);
        }

        function discussionBadgeValue() {
            /** Display the number of posts if greater than 0 */
            return vm.deliverableRecord.discussionThread.posts.length > 0 ?
                vm.deliverableRecord.discussionThread.posts.length : '';
        }

        function save(deliverableForm) {
            console.log(deliverableForm);

            deliverableRecord.saveChanges().then(function () {
                //todo split this logic out
                if (vm.userDeliverableFeedback.comments.length) {
                    vm.updateFeedback();
                }

                toastr.success("Deliverable updated");
                navigateBack();
            }, function () {
                toastr.error("There was a problem updating this deliverable record");
            });

        }

        function deleteRecord() {
            var confirmation = window.confirm('Are you sure you want to delete this deliverable?');
            if (confirmation) {
                deliverableRecord.deleteItem().then(function () {
                    toastr.success("Deliverable successfully deleted");
                    navigateBack();
                }, function () {
                    toastr.error("There was a problem deleting this deliverable record");
                });
            }
        }

        function cancel() {
            //TODO Need to revert back any changes to form fields
            navigateBack();
        }

        function deleteMyFeedback(feedback) {
            //TODO This currently doesn't fully purge the cache and needs to be addressed
            var confirmation = window.confirm('Are you sure you want to delete your feedback?');
            if(confirmation) {
                feedback.deleteItem()
                    .then(function () {
                        /** Record is deleted from server and local cache so instantiate a new feedback record */
                        vm.userDeliverableFeedback = deliverableRecord.getCachedFeedbackForCurrentUser();
                        toastr.success('Feedback successfully removed.')
                    })
            }

        }

        function navigateBack() {
            $state.go('deliverables.main', {
                mo: deliverableRecord.fiscalMonth,
                fy: deliverableRecord.fy
            });

        }

    }
})();
