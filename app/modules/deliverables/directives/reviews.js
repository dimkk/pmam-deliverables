(function () {
    'use strict';

    // I render the review details by user of a deliverable
    angular
        .module('pmam-deliverables')
        .directive('reviews', reviews);

    /* @ngInject */
    function reviews(ratingsService) {
        var directive = {
            link: link,
            templateUrl: 'modules/deliverables/directives/reviewsView.html',
            scope: {feedback: '='},
            restrict: 'EA'
        };
        return directive;

        function link(scope, element, attrs) {
            scope.starClass = ratingsService.starClass;
        }
    }
})();
