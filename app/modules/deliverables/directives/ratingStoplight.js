(function () {
    'use strict';

    angular
        .module('pmam-deliverables')
        .directive('ratingStoplight', ratingStoplight);

    function ratingStoplight() {
        return {
            controller: ratingStoplightController,
            controllerAs: 'vm',
            scope: {
                deliverable: '='
            },
            templateUrl: 'modules/deliverables/directives/ratingStoplight.html'
        };
    }

    function ratingStoplightController($scope) {
        var vm = this,
            deliverable = $scope.deliverable,
            acceptableCount = 0;

        vm.imageUrl = 'images/imnoff.png';
        vm.status = 'No reviews have been submitted for this deliverable.';

        var feedbackRecords = _.toArray(deliverable.getCachedFeedbackByDeliverableId());

        /** Increment for each feedback marked as acceptable */
        _.each(feedbackRecords, function(feedbackRecord) {
            if(feedbackRecord.acceptable) {
                acceptableCount++;
            }
        });

        if(feedbackRecords.length > 0) {
            if(feedbackRecords.length === acceptableCount) {
                /** All Acceptable */
                vm.imageUrl = 'images/imnon.png';
                vm.status = 'This deliverable has been rated as acceptable.';
            } else if(acceptableCount === 0) {
                /** All unacceptable */
                vm.imageUrl = 'images/imnbusy.png';
                vm.status = 'This deliverable has been rated as unacceptable.';
            } else {
                /** Combination of acceptable and unacceptable */
                vm.imageUrl = 'images/imnaway.png';
                vm.status = 'This deliverable has been rated as both acceptable and unacceptable by different reviewers.';
            }
        }

    }
})();
