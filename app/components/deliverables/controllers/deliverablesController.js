(function () {
    'use strict';

    // home page controller
    angular
        .module( 'pmam-deliverables' )
        .controller( 'deliverablesController', deliverablesController );

    function deliverablesController( $q, deliverableFeedbackModel, chartService, $state, fiscalYear,
                                     deliverableDefinitionsModel, deliverablesModel,
                                    deliverablesService, calendarService, deliverableAccessLogModel) {

        var vm = this;

        /** $state query string params return as strings, if they exist and can be converted to an int do it,
        otherwise use the current fiscal year and month */
        var fiscalMonth = isNaN($state.params.mo) ? calendarService.getCurrentFiscalMonth() : parseInt($state.params.mo);

        vm.decreaseDate = decreaseDate;
        vm.displayPeriod = calendarService.generateDisplayPeriod(fiscalMonth, fiscalYear);
        vm.fiscalMonth = fiscalMonth;
        vm.fiscalYear = fiscalYear;
        vm.gotData = false;
        vm.increaseDate = increaseDate;

        activate();

        /**==================PRIVATE==================*/

        function activate() {

            vm.gauge1 = new chartService.Gauge('Satisfaction');
            vm.gauge2 = new chartService.Gauge('OTD');

            $q.all([
                deliverablesModel.getDeliverablesForMonth( fiscalYear, fiscalMonth ),
                deliverableDefinitionsModel.getDeliverableDefinitionsForMonth( fiscalYear, fiscalMonth ),
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

        // 10/1 starts the new fiscal year
        function increaseDate() {
            var updatedMonth = fiscalMonth + 1;
            var updatedYear = fiscalYear;

            // if we're flipping to the new year, increment current fiscal year bucket
            if( updatedMonth > 12 ) {
                updatedYear = fiscalYear + 1;
                updatedMonth = 1;
            }

            $state.go('deliverables.monthly', {fy: updatedYear, mo: updatedMonth});
        }

        function decreaseDate() {
            var updatedMonth = fiscalMonth - 1;
            var updatedYear = fiscalYear;

            // if we're flipping to the previous year, decrement current fiscal year bucket
            if( updatedMonth === 0 ){
                updatedYear = updatedYear - 1;
                updatedMonth = 12;
            }

            $state.go('deliverables.monthly', {fy: updatedYear, mo: updatedMonth});
        }
    }
})();
