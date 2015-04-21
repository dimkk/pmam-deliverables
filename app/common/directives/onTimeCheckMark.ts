/// <reference path="../../../typings/app.d.ts" />
module app {
    'use strict';


    function onTimeCheckMark() {
        return {
            controller: OnTimeCheckMarkController,
            controllerAs: 'vm',
            scope: {
                deliverable: '='
            },
            template: `<i class="fa {{ vm.checkMarkClass }}" title="{{ vm.status }}"></i>`
        };
    }

    class OnTimeCheckMarkController{
        checkMarkClass:string;
        status:string;
        days:number;
        constructor($scope:{deliverable:Deliverable}) {
            var vm = this;
            var deliverable = $scope.deliverable;
            var daysBetweenSubmittedAndDue = deliverable.getDaysBetweenSubmittedAndDue();
            vm.days = daysBetweenSubmittedAndDue;
            if(deliverable.wasDeliveredOnTime()) {
                /** Submitted on or before the due date */
                vm.checkMarkClass = 'fa-check-square-o';
                vm.status = `Submitted ${daysBetweenSubmittedAndDue} day(s) before the due date.`;
            } else {
                /** Submitted after the due date */
                vm.checkMarkClass = 'fa-square-o';
                vm.status = `Submitted ${daysBetweenSubmittedAndDue * -1} day(s) after the due date.`;
            }
        }
    }

    angular
        .module('pmam-deliverables')
        .directive('onTimeCheckMark', onTimeCheckMark);


}
