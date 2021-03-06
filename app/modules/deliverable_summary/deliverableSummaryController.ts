/// <reference path="../../../typings/app.d.ts" />
module app {
    'use strict';
    var vm: DeliverableSummaryController;

    class DeliverableSummaryController {
        acceptabilityChart;
        activeChartType;
        chartTypes:IChartType[];
        onTimeChart;
        fiscalData;
        subTitle: string;
        subTitleInfo: string;
        subTitleIcon: string;
        availableTasks: Object[];
        activeTask: string;
        deliverablesModel: DeliverablesModel;
        deliverableDefinitionsModel: DeliverableDefinitionsModel;

        constructor(private $state, $scope: ng.IScope,private $q, deliverablesModel: DeliverablesModel,
            deliverableDefinitionsModel: DeliverableDefinitionsModel,
            deliverablesService: DeliverablesService, private deliverableFeedbackModel: DeliverableFeedbackModel,
            fiscalYear: number, private chartService, selectedTask: string, selectedChart: string) {
          

            vm = this;
            
         

            //Chart Types
            vm.chartTypes = chartService.chartTypes;
            for (var idx in vm.chartTypes) {
                if (vm.chartTypes[idx].label === selectedChart) {
                    vm.activeChartType = vm.chartTypes[idx];
                    break;
                }
            }
            
            

            //data
            vm.deliverableDefinitionsModel = deliverableDefinitionsModel;
            vm.deliverablesModel = deliverablesModel;
                                  
            //Fiscal Data and Watch
            vm.fiscalData = {fiscalMonth: undefined, fiscalYear: fiscalYear};
            $scope.$watch('vm.fiscalData', (newVal, oldVal) => {
                if (newVal && newVal !== oldVal) {
                   vm.$state.go('deliverables.summary', { fy: vm.fiscalData.fiscalYear, id: null,task: vm.activeTask }, { reload: true });
                }
            }, true);

            //task
            vm.activeTask = selectedTask;

            //Task watch
            vm.activeTask = selectedTask;
            $scope.$watch('vm.activeTask', (newVal, oldVal) => {
                if (newVal && newVal !== oldVal)
                    vm.$state.go('deliverables.summary', { fy: vm.fiscalData.fiscalYear, id: null, task: vm.activeTask }, { reload: true });
            });
            

            //Sub Navigation Title/Subtitle/Icon 
            vm.subTitle = 'DELIVERABLE SUMMARY';
            ///vm.subTitleInfo = 'Tasks 2.1 & 2.3';
            vm.subTitleIcon = 'fa fa-bar-chart icon-padding';
            
           
            $q.all([
                deliverablesModel.getFyDeliverables(vm.fiscalData.fiscalYear),
            ]).then(function (resolvedPromises) {
                //vm.availableTasks = resolvedPromises[1];

                //Update charts
                vm.updateChart();
            });
        }

         //Updates Charts based on current data.  Needs to be called outside of the constructor bc of the new ability to change selected task
        updateChart() {
            var allTaskItem = 'All'; //to identify
            var selectedTask: string = (vm.activeTask === allTaskItem ? undefined : vm.activeTask);
            vm.$q.all([
                vm.deliverableDefinitionsModel.getDeliverableDefinitionsByTaskNumber(vm.fiscalData.fiscalYear, selectedTask),
                vm.deliverableFeedbackModel.getFyFeedback(vm.fiscalData.fiscalYear)
            ]).then(function (resolvedPromises) {
                var definitions = resolvedPromises[0];
                
                //Set Charts
                vm.acceptabilityChart = new vm.chartService.AcceptabilityChart('Acceptability (' + (selectedTask === undefined ? 'All' : selectedTask) + ')', definitions, vm.activeChartType,false); 
                vm.onTimeChart = new vm.chartService.OnTimeChart('On Time (' + (selectedTask === undefined ? 'All' : selectedTask) + ')', definitions, vm.activeChartType,false);

                var opt1 = vm.acceptabilityChart.options;

                //vm.summary21 = deliverablesService.createDeliverableSummaryObject(definitions21);
                    //vm.summary23 = deliverablesService.createDeliverableSummaryObject(definitions23);
                //console.log(vm.acceptabilityChart);
                //This was put in to fix an issue observerd when chart was set to Bar chart and then task changed.  Active Chart Type was being lost and resulting in a column chart
                _.assign(vm.acceptabilityChart, vm.activeChartType);
                _.assign(vm.acceptabilityChart.options, opt1);
                _.assign(vm.onTimeChart, vm.activeChartType);
            });
        }

        //TODO: Figure out why changing chart types blows away defined colors 
        toggleChartTypes(updatedChartType) {
            vm.activeChartType = updatedChartType;
            vm.$state.go('deliverables.summary', { fy: vm.fiscalData.fiscalYear, id: null, task: vm.activeTask, ct: vm.activeChartType.label }, { reload: true });
            
            //_.assign(vm.acceptabilityChart, updatedChartType);
            //_.assign(vm.onTimeChart, updatedChartType);
        }

        chartItemSelected(obj,chartType) {
            var status;
            var definition;
                switch (chartType) {
                    case 'acceptabilityChart':
                        status = vm.acceptabilityChart.data.cols[obj.column];
                        definition = vm.acceptabilityChart.data.rows[obj.row];
                        if (definition && status) {
                            vm.$state.go('deliverables.instances', { fy: vm.fiscalData.fiscalYear, id: definition.id, task: vm.activeTask, feedbackStatus: status.label }, { reload: true });
                        }
                        break;
                    case 'onTimeChart':
                        status = vm.onTimeChart.data.cols[obj.column];
                        definition = vm.onTimeChart.data.rows[obj.row];
                        if (definition && status) {
                            vm.$state.go('deliverables.instances', { fy: vm.fiscalData.fiscalYear, id: definition.id, task: vm.activeTask, onTime: (status.label === 'Late' ? false : true) }, { reload: true });
                        }
                        break;
                }
        }
    }


    angular
        .module('pmam-deliverables')

    /** Override default chart config to use material design visualizations */
        .value('googleChartApiConfig', {
            version: '1.1',
            optionalSettings: {
                packages: ['line', 'bar'],
                language: 'en'
            }
        })
        .controller('deliverableSummaryController', DeliverableSummaryController);

}
