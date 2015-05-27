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
            scope: { selectedTask: '=', fiscalYear: '=', selectedDefinition: '=',filters: '=' },
            template: template
        };
    }
    class definitionSelectorController {
        definitions;
        selectedDefinition: Object;
        isVisible: boolean;
        constructor(private $scope, private deliverableDefinitionsModel: DeliverableDefinitionsModel, private deliverablesModel: DeliverablesModel) {
            vm = this;

            vm.isVisible = ($scope.visible !== undefined ? $scope.visible : true);

            
            deliverableDefinitionsModel.getDeliverableDefinitionsByTaskNumber($scope.fiscalYear, $scope.selectedTask)
                .then(function (resolvedPromise) {
                vm.definitions = _.toArray(resolvedPromise);
                
                vm.definitions.unshift({ title: 'All', id: undefined, deliverableNumber: 'All Deliverables', frequencyDescription: 'NA'});
                
                var count = 0;
                _.each(vm.definitions, (deliverableDefinition) => {
                   // console.log(deliverablesService.createDeliverableSummaryObject([deliverableDefinition]));
                    if (deliverableDefinition.id === $scope.selectedDefinition.id)
                        count += 1;
                });

                if (count === 0) {
                    $scope.selectedDefinition = vm.definitions[0];
                }
                else {
                    $scope.selectedDefinition = $scope.selectedDefinition;
                }

            });

        }

        getUpdateState() {
            vm.$scope.selectedDefinition = vm.selectedDefinition;
        }
        dropdownLabel(deliverableDefinition) {
            var deliverables = (deliverableDefinition.id ? deliverableDefinition.getDeliverablesForDefinition() : vm.deliverablesModel.getCachedDeliverablesByDefinitions(vm.definitions));
            _.each(vm.$scope.filters, (filter) => {
                switch (filter.key) {
                    case 'On Time':
                        deliverables = _.filter(deliverables, function (n) {
                            return n.wasDeliveredOnTime().toString() === filter.value;
                        });
                        break;
                    case 'Acceptable':
                        deliverables = _.filter(deliverables, function (n) {
                            return n.getAcceptableStatus() === filter.value;
                        });
                        break;
                }
                
            });
           // console.log(deliverables);
            return deliverableDefinition.title + ' (' + _.toArray(deliverables).length + ')';
        }
    }



    angular
        .module('pmam-deliverables')
        .directive('definitionSelector', definitionSelector);

}




