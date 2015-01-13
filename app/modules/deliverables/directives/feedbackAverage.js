(function () {
    'use strict';

    angular
        .module('pmam-deliverables')
        .directive('feedbackAverage', feedbackAverage);

    feedbackAverage.$inject = ['$window'];

    /* @ngInject */
    function feedbackAverage($window) {
        // Usage:
        //
        // Creates:
        //
        var directive = {
            link: link,
            templateUrl: 'modules/deliverables/directives/ratingsView.html',
            scope: {deliverable: '='},
            restrict: 'EA'
        };
        return directive;

        function link(scope, element, attrs) {

            var deliverableFeedback = scope.deliverable.getCachedFeedbackByDeliverableId();
            scope.state = {average: '5'};
            scope.state.reviewTotalString = "No Reviews";

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
