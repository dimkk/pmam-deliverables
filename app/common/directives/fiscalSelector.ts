/// <reference path="../../../typings/app.d.ts" />
module app {
    'use strict';
    var vm: fiscalSelectorController;
    var template = `
    <form class="navbar-form navbar-right" ng-if="vm.fy !== 'undefined'">
            <div class="btn-group">
                <button class="btn btn-default pull-left" type="button"  ng-click="vm.decrementFiscalDate()">
                    <i class="fa fa-arrow-left"></i>
                </button>
                <span class="pull-left time-indicator text-muted">{{ vm.displayFiscal() }}</span>
                <button class="btn btn-default pull-left" type="button" ng-click="vm.incrementFiscalDate()">
                    <i class="fa fa-arrow-right"></i>
                </button>
            </div>
    </form>
                `;

    function fiscalSelector() {
        return {
            controller: fiscalSelectorController,
            controllerAs: 'vm',
            scope: { fiscalMonth: '=', fiscalYear : '='},
            template: template
        };
    }
    class fiscalSelectorController {
        
        constructor(private $scope, private calendarService: CalendarService) {
            vm = this;
        }

        decrementFiscalDate() {
            var updatedMonth = (vm.$scope.fiscalMonth ? vm.$scope.fiscalMonth - 1 : 0);
            var updatedYear = vm.$scope.fiscalYear;
            // if we're flipping to the previous year, decrement current fiscal year bucket
            if (updatedMonth === 0) {
                updatedYear = updatedYear - 1;
                updatedMonth = 12;
            }
            vm.$scope.fiscalYear = updatedYear;
            vm.$scope.fiscalMonth = (vm.$scope.fiscalMonth ? updatedMonth : undefined);
        }
        displayFiscal() {
            return (vm.$scope.fiscalMonth ? vm.calendarService.generateDisplayPeriod(vm.$scope.fiscalMonth, vm.$scope.fiscalYear) : 'FY ' + vm.$scope.fiscalYear.toString().slice(-2));
           // return (vm.parentScope.fiscalMonth ? vm.cs.generateDisplayPeriod(vm.parentScope.fiscalMonth, vm.parentScope.fiscalYear) : 'FY ' + vm.parentScope.fiscalYear.toString().slice(-2));
        }
        incrementFiscalDate() {
            var updatedMonth = (vm.$scope.fiscalMonth ? vm.$scope.fiscalMonth + 1 : 13);
            var updatedYear = vm.$scope.fiscalYear;                        
           
            // if we're flipping to the next year, increment current fiscal year bucket
            if (updatedMonth > 12) {
                updatedYear += 1;
                updatedMonth = 1;
            }

            vm.$scope.fiscalYear = updatedYear;
            vm.$scope.fiscalMonth = (vm.$scope.fiscalMonth ? updatedMonth : undefined);
        }
    }

    

    angular
        .module('pmam-deliverables')
        .directive('fiscalSelector', fiscalSelector);

}

 