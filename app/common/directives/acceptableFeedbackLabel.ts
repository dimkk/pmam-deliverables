/// <reference path="../../../typings/app.d.ts" />
module app {
    'use strict';

    var template = `<span ng-if="vm.feedback.acceptable === true" class="label label-success"
                        title="This deliverable has been rated as ACCEPTABLE.">Acceptable</span>
                    <span ng-if="vm.feedback.acceptable === false" class="label label-danger"
                        title="This deliverable has been rated as UNACCEPTABLE.">Unacceptable</span>`;

    function acceptableFeedbackLabel() {
        return {
            controller: acceptableFeedbackLabelController,
            controllerAs: 'vm',
            scope: {feedback: '='},
            template: template
        };
    }

    function acceptableFeedbackLabelController($scope) {
        var vm = this;
        vm.feedback = $scope.feedback;
    }

    angular
        .module('pmam-deliverables')
        .directive('acceptableFeedbackLabel', acceptableFeedbackLabel);

}

