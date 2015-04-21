/// <reference path="../../../typings/app.d.ts" />
module app {
    'use strict';


    class DefinitionsController {
        fiscalYearDisplay:string;
        searchString = '';
        deliverableDefinitions:{[key:number]:DeliverableDefinition};
        constructor(private $state:angular.ui.IStateService, $q,
                    private deliverableDefinitionsModel:DeliverableDefinitionsModel,
                    private deliverablesModel:DeliverablesModel, private fiscalYear:number) {

            var vm = this;

            vm.fiscalYearDisplay = 'FY ' + vm.fiscalYear.toString().slice(-2);

            $q.all([
                deliverableDefinitionsModel.getFyDefinitions(vm.fiscalYear),
                deliverablesModel.getFyDeliverables(vm.fiscalYear)
            ])
                .then((resolvedPromises) => vm.deliverableDefinitions = resolvedPromises[0]);

        }

        deliverableCountByDefinition(definition) {
            var deliverableInstances = definition.getDeliverablesForDefinition();
            return _.toArray(deliverableInstances).length;
        }

        nextFiscalYear() {
            var updatedFiscalYear = this.fiscalYear + 1;
            this.$state.go('deliverables.types', {fy: updatedFiscalYear});

        }

        priorFiscalYear() {
            var updatedFiscalYear = this.fiscalYear - 1;
            this.$state.go('deliverables.types', {fy: updatedFiscalYear});
        }
    }

    angular
        .module('pmam-deliverables')
        .controller('definitionsController', DefinitionsController);

}
