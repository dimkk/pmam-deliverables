/// <reference path="../../../typings/app.d.ts" />
module app {
    'use strict';
    var vm: taskSelectorController;
    var template = `
    <div class="form-group" ng-if="vm.$scope.selectedTask">
        <label>Task &nbsp; </label>
        <select class="form-control" ng-model="vm.$scope.selectedTask"
            ng-options="task as task for task in vm.availableTasks"> </select>
    </div> 
                `;

    function taskSelector() {
        return {
            controller: taskSelectorController,
            controllerAs: 'vm',
            scope: { selectedTask: '=',fiscalYear: '='  },
            template: template
        };
    }
    class taskSelectorController {
        availableTasks;
        constructor(private $scope, private $q, private deliverableDefinitionsModel: DeliverableDefinitionsModel) {
            vm = this;
            
            deliverableDefinitionsModel.getAvailableTaskNumbers($scope.fiscalYear).then(function (resolvedPromise) {
                vm.availableTasks = resolvedPromise;
                
                //add the all option and set the current task
                var allTaskItem = 'All';
                vm.availableTasks.unshift(allTaskItem);
                if ($scope.selectedTask === undefined)
                    $scope.selectedTask = allTaskItem;
            });
        }
    }



    angular
        .module('pmam-deliverables')
        .directive('taskSelector', taskSelector);

}

 


