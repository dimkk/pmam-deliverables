(function () {
    'use strict';

    // I calculate and render the average rating of a deliverable based on user reviews

    angular
        .module('pmam-deliverables')
        .directive('ratingsAverage', ratingsAverage);

    /* @ngInject */
    function ratingsAverage(_) {
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
            var feedbackRecords = _.toArray(scope.deliverable.getCachedFeedbackByDeliverableId());
            var feedbackCount = feedbackRecords.length;
            scope.state = {
                average: 0,
                tooltipText: 'No ratings submitted yet.',
                feedbackCount: 0
            };

            if (feedbackCount > 0) {
                scope.state.average = scope.deliverable.getRatingsAverage();
                scope.state.tooltipText = 'Average rating of ' + scope.state.average + ' ' +
                ' (' + feedbackCount + ' review' + (feedbackCount === 1 ? '' : 's') + ')';
            }

            scope.hoveringOver = function (value) {
                scope.overStar = value;
                scope.percent = 100 * (value / scope.max);
            };
        }
    }
})();
