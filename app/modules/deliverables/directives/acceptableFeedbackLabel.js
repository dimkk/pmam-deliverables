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
            templateUrl: 'modules/deliverables/directives/acceptableFeedbackLabel.html'
        };
    }

    function acceptableFeedbackLabelController($scope) {
        var vm = this;
        vm.feedback = $scope.feedback;
    }
})();
