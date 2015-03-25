(function () {
    'use strict';

    // controller handling updates to existing deliverables
    angular
        .module('pmam-deliverables')
        .controller('deliverableFormEditController', deliverableFormEditController);

    /* @ngInject */
    function deliverableFormEditController(deliverableFeedbackModel, toastr, $state, deliverableDefinitionsModel,
                                           userService, $q, deliverableRecord, ratingsService, calendarService, $scope) {

        //TODO Need to add logic to revert back to pristine deliverable in cache if entity is updated and user leaves without saving
        var vm = this;
        /** Allows us to navigate directly to discussion tab */
        vm.activeTab = $state.params.activeTab ? $state.params.activeTab : 'main'; //2 tabs are ['main', 'discussion']
        vm.cancel = cancel;
        vm.dataReady = false;
        vm.deleteMyFeedback = deleteMyFeedback;
        vm.deleteRecord = deleteRecord;
        vm.deliverableRecord = deliverableRecord;
        vm.discussionBadgeValue = discussionBadgeValue;
        vm.getFeedbackArray = getFeedbackArray;
        vm.getLabelClass = ratingsService.getLabelClass;
        vm.hoveringOver = hoveringOver;
        vm.monthOptions = calendarService.getMonthOptions();
        vm.provideFeedback = provideFeedback;
        vm.save = save;
        vm.starClass = ratingsService.starClass;
        vm.updateFeedback = updateFeedback;
        vm.userCanContribute = userService.userCanContribute;

        // rating settings
        vm.rate = 5;
        vm.max = 5;
        vm.isReadonly = false;

        activate();

        /**==================PRIVATE==================*/

        function activate() {

            if (!deliverableRecord) {
                /** Redirect if a valid deliverable isn't found */
                toastr.error('The requested deliverable wasn\'t found.');
                return $state.go('deliverables.monthly');
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

                //TODO Clean this up, currently it's here just to initialize the percent label if the user has feedback
                if (vm.userDeliverableFeedback) {
                    vm.percent = 100 * (vm.userDeliverableFeedback.rating / vm.max);
                }

                vm.dataReady = true;
            });

            /** Create a log record so we can collect metrics on the average duration a user is on this page */
            deliverableRecord.registerDeliverableAccessEvent()
                .then(function (deliverableAccessEvent) {
                    /** Wait for user to leave current state so we can log it */
                    $scope.$on('$stateChangeStart', function () {
                        /** Causes modified date to reflect updated time so we can get delta between created and modified */
                        deliverableAccessEvent.saveChanges();
                    });
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

        function save() {
            deliverableRecord.saveChanges().then(function () {
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
            if (confirmation) {
                feedback.deleteItem()
                    .then(function () {
                        /** Record is deleted from server and local cache so instantiate a new feedback record */
                        vm.userDeliverableFeedback = deliverableRecord.getCachedFeedbackForCurrentUser();
                        toastr.success('Feedback successfully removed.')
                    })
            }
        }

        function getFeedbackArray() {
            return _.toArray(vm.deliverableRecord.getCachedFeedbackByDeliverableId());
        }

        function navigateBack() {
            $state.go('deliverables.monthly', {
                mo: deliverableRecord.fiscalMonth,
                fy: deliverableRecord.fy
            });

        }

        function provideFeedback(isAcceptable) {
            var previousAcceptability = vm.userDeliverableFeedback.acceptable;
            vm.deliverableRecord.openFeedbackModal({acceptable: isAcceptable}, vm.userDeliverableFeedback)
                .then(function (updatedFeedback) {
                    //No action necessary because user saved
                    vm.userDeliverableFeedback = updatedFeedback;
                }, function (err) {
                    //Revert back to previous state of feedback because user cancelled
                    vm.userDeliverableFeedback.acceptable = previousAcceptability;
                });
        }

    }
})();
