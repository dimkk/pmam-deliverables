/// <reference path="../../../typings/tsd.d.ts" />

module app.layout {
    'use strict';

    interface IDeliverablesController {
        decreaseDate: Function;
        displayPeriod?: String;
        fiscalMonth?: Number;
        fiscalYear : Number;
        gotData : Boolean;
        increaseDate : Function;
    }

    class deliverablesController implements IDeliverablesController {
        gotData = false;

        constructor($q: ng.IQService, deliverableFeedbackModel, chartService, private $state: ng.ui.IState, public fiscalYear:number,
                    deliverableDefinitionsModel, deliverablesModel,
                    deliverablesService, calendarService, deliverableAccessLogModel) {
            var vm = this;

            activate();

            /**==================PRIVATE==================*/

            function activate() {

                /** $state query string params return as strings, if they exist and can be converted to an int do it,
                 otherwise use the current fiscal year and month */
                this.fiscalMonth = isNaN($state.params.mo) ? calendarService.getCurrentFiscalMonth() : parseInt($state.params.mo);

                vm.gauge1 = new chartService.Gauge('Satisfaction');
                vm.gauge2 = new chartService.Gauge('OTD');

                $q.all([
                    deliverablesModel.getDeliverablesForMonth( fiscalYear, this.fiscalMonth ),
                    deliverableDefinitionsModel.getDeliverableDefinitionsForMonth( fiscalYear, this.fiscalMonth ),
                    deliverableFeedbackModel.getFyFeedback(fiscalYear),
                    deliverableAccessLogModel.getFyAccessLogs(fiscalYear)
                ])
                    .then(function(resolvedPromises) {
                        vm.visibleDeliverables = resolvedPromises[0];
                        vm.deliverableDefinitionsByMonth = resolvedPromises[1];
                        vm.outstandingDefinitions = deliverablesService
                            .identifyOutstandingDefinitionsForMonth(vm.visibleDeliverables, vm.deliverableDefinitionsByMonth);

                        vm.deliverableFeedback = resolvedPromises[2];

                        vm.gauge1.updateGaugeValue(chartService.getSatisfactionRating(vm.visibleDeliverables));
                        vm.gauge2.updateGaugeValue(chartService.getOnTimeDeliveryRating(vm.visibleDeliverables));

                        vm.gotData = true;
                    });

            }

        }


        // 10/1 starts the new fiscal year
        increaseDate(): void {
            var updatedMonth = this.fiscalMonth + 1;
            var updatedYear = this.fiscalYear;

            // if we're flipping to the new year, increment current fiscal year bucket
            if (updatedMonth > 12) {
                updatedYear = this.fiscalYear + 1;
                updatedMonth = 1;
            }

            this.$state.go('deliverables.monthly', {fy: updatedYear, mo: updatedMonth});
        }

        decreaseDate(): void {
            var updatedMonth = fiscalMonth - 1;
            var updatedYear = fiscalYear;

            // if we're flipping to the previous year, decrement current fiscal year bucket
            if (updatedMonth === 0) {
                updatedYear = updatedYear - 1;
                updatedMonth = 12;
            }

            this.$state.go('deliverables.monthly', {fy: updatedYear, mo: updatedMonth});
        }


    }

    angular
        .module('pmam-deliverables')
        .controller('deliverablesController', deliverablesController);

}
