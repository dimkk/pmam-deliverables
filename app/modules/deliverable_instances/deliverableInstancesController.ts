/// <reference path="../../../typings/app.d.ts" />
module app {
    'use strict';

    var vm: DeliverableInstancesController;



    /* @ngInject */
    class DeliverableInstancesController {
        //gauge1:Object;
        //gauge2:Object;
        //deliverableGrid:Object;
        gotData = false;
        //showFeedback = false;
        visibleDeliverables: Deliverable[] = [];
        subTitle: string;
        subTitleInfo: string;
        subTitleIcon: string;
        fiscalData;
        definitions: DeliverableDefinition[];
        activeTask;

        deliverableGrid = {
            enableFiltering: true,
            useExternalFiltering: true,
            autoResize: true,
            enableGridMenu: true,
            enableSorting: true,
            //showGridFooter: true,
            showGroupPanel: true,
            columnDefs: undefined
        };
        constructor(private $state,private $scope, private $q,  deliverableFeedbackModel: DeliverableFeedbackModel,
            private deliverablesModel: DeliverablesModel, chartService, private fyDefinitions: DeliverableDefinition[],
            private deliverableDefinitionsModel: DeliverableDefinitionsModel, private selectedDefinition: DeliverableDefinition, private fiscalYear: number,
            uiGridService, selectedTask) {

            vm = this;
            vm.deliverableGrid.columnDefs = uiGridService.getDeliverableFields();



            //SubTitle and Icon
            vm.subTitle = 'RELATED DELIVERABLES';
            vm.subTitleInfo = '';
            vm.subTitleIcon = 'fa fa-check-square icon-padding';

            //Task
            vm.activeTask = selectedTask;


            /** Stop Everything if a valid definition isn't available */
            if (!selectedDefinition) {
                return null;
            }


            //Fiscal Data and Watch
            vm.fiscalData = { fiscalMonth: undefined, fiscalYear: fiscalYear };
            $scope.$watch('vm.fiscalData', (newVal, oldVal) => {
                if (newVal && newVal !== oldVal)
                    vm.$state.go('deliverables.instances', { fy: vm.fiscalData.fiscalYear, task: vm.activeTask, id: vm.selectedDefinition.id });
            }, true);

            $scope.$watch('vm.activeTask', (newVal, oldVal) => {
                if (newVal && newVal !== oldVal)
                    vm.$state.go('deliverables.instances', { fy: vm.fiscalData.fiscalYear, task: vm.activeTask, id: vm.selectedDefinition.id });
            });


            $scope.$watch('vm.selectedDefinition', (newVal, oldVal) => {
                if (newVal && newVal !== oldVal)
                    vm.$state.go('deliverables.instances', { fy: vm.fiscalData.fiscalYear, task: vm.activeTask, id: vm.selectedDefinition.id });
            });

         vm.activate();
        }


        activate() {
            //vm.gauge1 = new chartService.Gauge('Satisfaction');
            //vm.gauge2 = new chartService.Gauge('OTD');
            // deliverableFeedbackModel.getFyFeedback(vm.fiscalData.fiscalYear),
            //deliverableAccessLogModel.getFyAccessLogs(vm.fiscalData.fiscalYear)

            vm.deliverablesModel.getFyDeliverables(vm.fiscalData.fiscalYear)
                .then(function (resolvedPromise) {
                vm.visibleDeliverables = (vm.selectedDefinition.id != null ? _.toArray(vm.selectedDefinition.getDeliverablesForDefinition()) :[] );
                vm.deliverableGrid.data = vm.visibleDeliverables;
                vm.gotData = true;

                //    //vm.gauge1.updateGaugeValue(chartService.getSatisfactionRating(vm.visibleDeliverables));
                //    //vm.gauge2.updateGaugeValue(chartService.getOnTimeDeliveryRating(vm.visibleDeliverables));
            });
        }

        dropdownLabel(deliverableDefinition) {
            var deliverables = deliverableDefinition.getDeliverablesForDefinition();
            return deliverableDefinition.title + ' (' + _.toArray(deliverables).length + ')';
        }
    }

    angular
        .module('pmam-deliverables')
        .controller('deliverableInstancesController', DeliverableInstancesController);

}
