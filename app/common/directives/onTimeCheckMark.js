(function () {
    'use strict';

    angular
        .module('pmam-deliverables')
        .directive('onTimeCheckMark', onTimeCheckMark);

    function onTimeCheckMark() {
        return {
            controller: onTimeCheckMarkController,
            controllerAs: 'vm',
            scope: {
                deliverable: '='
            },
            template: '<i class="fa {{ vm.checkMarkClass }}" title="{{ vm.status }}"></i>'
        };
    }

    function onTimeCheckMarkController($scope) {
        var vm = this;
        var deliverable = $scope.deliverable;
        var daysBetweenSubmittedAndDue = deliverable.getDaysBetweenSubmittedAndDue();
        if(daysBetweenSubmittedAndDue < 0) {
            /** Submitted after the due date */
            vm.checkMarkClass = 'fa-square-o';
            vm.status = 'Submitted ' + daysBetweenSubmittedAndDue * -1 + ' day(s) after the due date.';
        } else {
            /** Submitted on or before the due date */
            vm.checkMarkClass = 'fa-check-square-o';
            vm.status = 'Submitted ' + daysBetweenSubmittedAndDue + ' day(s) before the due date.';
        }
    }

})();
