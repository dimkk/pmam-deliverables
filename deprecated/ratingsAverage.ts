/// <reference path="../../../typings/app.d.ts" />
module app {
    'use strict';

    // I calculate and render the average rating of a deliverable based on user reviews
    var template = `<rating state-on="'fa fa-star fa-lg'" state-off="'fa fa-star-o fa-lg'"
                        disabled="disabled"
                        ng-model="state.average" tooltip="{{state.tooltipText}}"
                        max="5" readonly="true">
                    </rating>`;

    /* @ngInject */
    function RatingsAverage() {
        var directive = {
            link: Link,
            template: template,
            scope: {deliverable: '='},
            restrict: 'EA'
        };
        return directive;
    }

    class Link{
        constructor(scope, element, attrs) {
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

    angular
        .module('pmam-deliverables')
        .directive('ratingsAverage', RatingsAverage);


}
