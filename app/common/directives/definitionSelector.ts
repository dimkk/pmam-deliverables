/// <reference path="../../../typings/app.d.ts" />
module app {
    'use strict';
    var vm: definitionSelectorController;
    var template = `

       <div class="form-group" >
                <label>Type&nbsp;</label>
                <select ng-model="vm.$scope.selectedDefinition"
                        class="form-control"
                        data-ng-options="vm.dropdownLabel(deliverableDefinition) for deliverableDefinition in vm.definitions | toArray | orderBy: 'title' track by deliverableDefinition.id"></select>

            </div>`;
    function definitionSelector() {
        return {
            controller: definitionSelectorController,
            controllerAs: 'vm',
            scope: { selectedTask: '=', fiscalYear: '=', selectedDefinition: '=' },
            template: template
        };
    }
    class definitionSelectorController {
        definitions;
        selectedDefinition: Object;
        isVisible: boolean;
        constructor(private $scope, private deliverableDefinitionsModel: DeliverableDefinitionsModel) {
            vm = this;

            vm.isVisible = ($scope.visible !== undefined ? $scope.visible : true);


            deliverableDefinitionsModel.getDeliverableDefinitionsByTaskNumber($scope.fiscalYear, ($scope.selectedTask == 'All' ? undefined : $scope.selectedTask))
                .then(function (resolvedPromise) {
                vm.definitions = _.toArray(resolvedPromise);


                var count = 0;
                _.each(vm.definitions, (deliverableDefinition) => {
                    if (deliverableDefinition.id === $scope.selectedDefinition.id)
                        count += 1;
                });

                if (count === 0)
                    $scope.selectedDefinition = vm.definitions[0];

            });

        }

        getUpdateState() {

            vm.$scope.selectedDefinition = vm.selectedDefinition;
        }
        dropdownLabel(deliverableDefinition) {
            var deliverables = deliverableDefinition.getDeliverablesForDefinition();
            return deliverableDefinition.title + ' (' + _.toArray(deliverables).length + ')';
        }
    }



    angular
        .module('pmam-deliverables')
        .directive('definitionSelector', definitionSelector);

}




