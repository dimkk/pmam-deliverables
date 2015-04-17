/// <reference path="../../../typings/app.d.ts" />
module app {
    'use strict';

    var template = `<image src="images/imnoff.png" ng-src="{{ vm.imageUrl }}" alt="Deliverable Acceptability Stoplight" title="{{ vm.status }}"></image>`;

    function RatingStoplight() {
        return {
            controller: RatingStoplightController,
            controllerAs: 'vm',
            scope: {
                deliverable: '='
            },
            template: template
        };
    }

    class RatingStoplightController{
        imageUrl = 'images/imnoff.png';
        status = 'No reviews have been submitted for this deliverable.';
        constructor($scope:{deliverable:Deliverable}) {
            var vm = this,
                deliverable = $scope.deliverable,
                acceptableCount = 0;

            var feedbackRecords = _.toArray(deliverable.getCachedFeedbackByDeliverableId());

            /** Increment for each feedback marked as acceptable */
            _.each(feedbackRecords, function (feedbackRecord) {
                if (feedbackRecord.acceptable) {
                    acceptableCount++;
                }
            });

            if (feedbackRecords.length > 0) {
                if (feedbackRecords.length === acceptableCount) {
                    /** All Acceptable */
                    vm.imageUrl = 'images/imnon.png';
                    vm.status = 'This deliverable has been rated as acceptable.';
                } else if (acceptableCount === 0) {
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
    }

    angular
        .module('pmam-deliverables')
        .directive('ratingStoplight', RatingStoplight);

}
