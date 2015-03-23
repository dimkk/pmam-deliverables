(function () {
    'use strict';

    angular
        .module('pmam-deliverables')
        .directive('acceptableFeedbackLabel', acceptableFeedbackLabel);

    function acceptableFeedbackLabel() {
        return {
            controller: acceptableFeedbackLabelController,
            controllerAs: 'vm',
            scope: {feedback: '='},
            templateUrl: 'common/directives/acceptableFeedbackLabel.html'
        };
    }

    function acceptableFeedbackLabelController($scope) {
        var vm = this;
        vm.feedback = $scope.feedback;
    }
})();
