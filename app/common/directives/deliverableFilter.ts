/// <reference path="../../../typings/app.d.ts" />
module app {
    'use strict';
    var vm: deliverableFilterController;
    var template = `
       <div ng-repeat="filter in vm.activeFilters" ng-if="filter.value" class="pull-right">
                <label>{{filter.key}} :</label> {{filter.value}}
                <a href="#" ng-click="vm.removeFilter(filter.key)" class="badge"><i class="fa fa-times"></i></a>
            </div>
`;
    function deliverableFilter() {
        return {
            controller: deliverableFilterController,
            controllerAs: 'vm',
            scope: { filters: '=' },
            template: template
        };
    }
    class deliverableFilterController {
        activeFilters: { key: string, value: string }[];
        constructor(private $scope ) {
            vm = this;
            vm.activeFilters = $scope.filters;
        }

        //Removes Active filter from collection
        removeFilter(key) {
            vm.activeFilters = _.remove(vm.activeFilters, function (n) {
                return n.key !== key;
            });

            vm.$scope.filters = vm.activeFilters;
        }
    }
    angular
        .module('pmam-deliverables')
        .directive('deliverableFilter', deliverableFilter);

}




