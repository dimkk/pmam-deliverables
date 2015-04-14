/// <reference path="../../../typings/app.d.ts" />
module app {
    'use strict';

    class DeliverableSummaryController{
        activeChartType;
        summary21;
        summary23;
        acceptabilityChart21;
        acceptabilityChart23;
        onTimeChart21;
        onTimeChart23;
        chartTypes:IChartType[];
        constructor($q, deliverablesModel:DeliverablesModel,
                    deliverableDefinitionsModel:DeliverableDefinitionsModel,
                    deliverablesService:DeliverablesService,
                    fiscalYear:number, private chartService) {
            var vm = this;
            vm.chartTypes = chartService.chartTypes;
            vm.activeChartType = vm.chartTypes[2];

            activate();


            /**==================PRIVATE==================*/

            function activate() {
                $q.all([
                    deliverablesModel.getFyDeliverables(fiscalYear),
                    deliverableDefinitionsModel.getDeliverableDefinitionsByTaskNumber(fiscalYear, '2.1'),
                    deliverableDefinitionsModel.getDeliverableDefinitionsByTaskNumber(fiscalYear, '2.3')
                ]).then(function (resolvedPromises) {
                    var deliverables = resolvedPromises[0];
                    var definitions21 = resolvedPromises[1];
                    var definitions23 = resolvedPromises[2];

                    //vm.summary21 = deliverablesService.createDeliverableSummaryObject(definitions21);
                    //vm.summary23 = deliverablesService.createDeliverableSummaryObject(definitions23);
                    //console.log(vm.summary21);

                    vm.acceptabilityChart21 = new vm.chartService.AcceptabilityChart('Acceptability (Task 2.1)', definitions21, vm.activeChartType);
                    vm.acceptabilityChart23 = new vm.chartService.AcceptabilityChart('Acceptability (Task 2.3)', definitions23, vm.activeChartType);
                    vm.onTimeChart21 = new vm.chartService.OnTimeChart('On Time (2.1)', definitions21, vm.activeChartType);
                    vm.onTimeChart23 = new vm.chartService.OnTimeChart('On Time (2.3)', definitions23, vm.activeChartType);

                });


                //deliverablesService.getGroupedFyDeliverablesByTaskNumber(fiscalYear)
                //    .then(function (groupedDeliverablesByTaskNumber) {
                //        console.log(groupedDeliverablesByTaskNumber);
                //        vm.groupedDeliverablesByTaskNumber = groupedDeliverablesByTaskNumber;
                //    })


            }
        }
        toggleChartTypes(updatedChartType) {
            //var updatedChartType = this.acceptabilityChart21.type === 'ColumnChart' ? 'BarChart' : 'ColumnChart';
            _.assign(this.acceptabilityChart21, updatedChartType);
            _.assign(this.acceptabilityChart21, updatedChartType);
            _.assign(this.acceptabilityChart23, updatedChartType);
            _.assign(this.onTimeChart21, updatedChartType);
            _.assign(this.onTimeChart23, updatedChartType);
            console.log(updatedChartType);

        }
    }


    angular
        .module('pmam-deliverables')
        .value('googleChartApiConfig', {
            version: '1.1',
            optionalSettings: {
                packages: ['line', 'bar'],
                language: 'en'
            }
        })
        .controller('deliverableSummaryController', DeliverableSummaryController);

}
