(function () {
    'use strict';

    // I render the review details by user of a deliverable
    angular
        .module('pmam-deliverables')
        .directive('reviews', reviews);

    function reviews() {
        var directive = {
            controller: reviewsController,
            controllerAs: 'vm',
            scope: {feedback: '='},
            templateUrl: 'common/directives/reviewsView.html'
        };
        return directive;
    }

    function reviewsController($scope) {
        var vm = this;
        vm.feedback = $scope.feedback;
        //vm.starClass = ratingsService.starClass;
    }
})();
