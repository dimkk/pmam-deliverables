(function () {
    'use strict';

    angular
        .module('pmam-deliverables')
        .directive('reviews', reviews);

    reviews.$inject = ['$window'];

    /* @ngInject */
    function reviews($window) {
        // Usage:
        //
        // Creates:
        //
        var directive = {
            link: link,
            templateUrl: 'modules/deliverables/directives/reviewsView.html',
            scope: {feedback: '='},
            restrict: 'EA'
        };
        return directive;

        function link(scope, element, attrs) {

            var deliverableFeedback = scope.feedback;

            scope.state = {};
            scope.state.rating = deliverableFeedback.rating;
            scope.state.created = deliverableFeedback.created;
            scope.state.author = deliverableFeedback.author.lookupValue;
            scope.state.comments = deliverableFeedback.comments;
        }
    }
})();
