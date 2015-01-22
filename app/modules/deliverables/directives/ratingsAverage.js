(function () {
    'use strict';

    angular
        .module('pmam-deliverables')
        .directive('ratingsAverage', ratingsAverage);

    ratingsAverage.$inject = ['$window'];

    /* @ngInject */
    function ratingsAverage($window) {
        // Usage:
        //
        // Creates:
        //
        var directive = {
            link: link,
            templateUrl: 'modules/deliverables/directives/ratingsAverageView.html',
            scope: {deliverable: '='},
            restrict: 'EA'
        };
        return directive;

        function link(scope, element, attrs) {

            var deliverableFeedback = scope.deliverable.getCachedFeedbackByDeliverableId();
            scope.state = {average: '0'};
            scope.state.reviewTotalString = "No Reviews";
            scope.state.deliverableId = scope.deliverable.Id;

            if (deliverableFeedback) {

                var feedbackArray = _.toArray(deliverableFeedback);
                var rating = 0;

                _.each(feedbackArray, function (feedback) {
                    rating += feedback.rating;
                });

                scope.state.average = rating / feedbackArray.length;
                scope.state.reviewTotal = feedbackArray.length;
                if (scope.state.reviewTotal === 1) {
                    scope.state.reviewTotalString = '1 Review';
                }
                if (scope.state.reviewTotal > 1) {
                    scope.state.reviewTotalString = scope.state.reviewTotal + ' Reviews';
                }
            }

            scope.hoveringOver = function (value) {
                scope.overStar = value;
                scope.percent = 100 * (value / scope.max);
            };
        }
    }
})();
