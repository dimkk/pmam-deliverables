(function () {
    'use strict';

    angular
        .module('pmam-deliverables')
        .directive('ratingsDirective', ratingsDirective);

    ratingsDirective.$inject = ['$window'];

    /* @ngInject */
    function ratingsDirective($window) {
        // Usage:
        //
        // Creates:
        //
        var directive = {
            link: link,
            restrict: 'A',
            scope: {deliverable: '=', feedback: '='},
            template: '<div rating ng-model="rate" max="max" readonly="isReadonly" on-hover="hoveringOver(value)" on-leave="overStar = null"></div>'

        };

        return directive;

        function link(scope) {

            scope.rate = calcRating(
                scope.feedback || []
            ) || 5;
            scope.max = 5;
            scope.isReadonly = true;

            scope.hoveringOver = function (value) {
                scope.overStar = value;
                scope.percent = 100 * (value / scope.max);
            };
        }

        function calcRating(feedbackArray) {

            var rating = 0;

            _.each(feedbackArray, function (feedback) {
                rating += feedback.rating;
            });

            return rating / feedbackArray.length;
        }
    }
})();
