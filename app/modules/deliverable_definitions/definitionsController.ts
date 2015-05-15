/// <reference path="../../../typings/app.d.ts" />
module app {
    'use strict';

    var vm: DefinitionsController;

    class DefinitionsController {
        searchString = '';
        deliverableDefinitions: { [key: number]: DeliverableDefinition };
        subTitle: string;
        subTitleInfo: string;
        subTitleIcon: string;
        fiscalData;
        showDefintions: boolean;
        
        constructor(private $scope, private $state:angular.ui.IStateService, $q,
                    private deliverableDefinitionsModel:DeliverableDefinitionsModel,
                    private deliverablesModel:DeliverablesModel, private fiscalYear:number) {

            vm = this;

            //SubTitle and Icon
            vm.subTitle = "FY DELIVERABLES";
            vm.subTitleIcon = "fa fa-lg fa-list-ol icon-padding";
                                    
            //Fiscal Data and Watch
            vm.fiscalData = { fiscalMonth: undefined, fiscalYear: fiscalYear };
            $scope.$watch('vm.fiscalData', (newVal, oldVal) => {
                if (newVal && newVal !== oldVal) {
                    vm.$state.go('deliverables.types', { fy: vm.fiscalData.fiscalYear });
                }
            }, true);

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

        
    }

    angular
        .module('pmam-deliverables')
        .controller('definitionsController', DefinitionsController);

}
