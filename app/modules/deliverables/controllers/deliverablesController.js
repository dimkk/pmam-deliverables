(function () {
    'use strict';

    // home page controller
    angular
        .module( 'pmam-deliverables' )
        .controller( 'deliverablesController', deliverablesController );

    function deliverablesController($q, deliverableFeedbackModel, chartService, $state,
                                    deliverablesService, calendarService) {

        var vm = this;

        /** $state query string params return as strings, if they exist and can be converted to an int do it,
        otherwise use the current fiscal year and month */
        var fiscalYear = isNaN($state.params.fy) ? calendarService.getCurrentFiscalYear() : parseInt($state.params.fy);
        var fiscalMonth = isNaN($state.params.mo) ? calendarService.getCurrentFiscalMonth() : parseInt($state.params.mo);

        vm.decreaseDate = decreaseDate;
        vm.deliverableFrequencyFilter = deliverableFrequencyFilter;
        vm.displayPeriod = calendarService.generateDisplayPeriod(fiscalMonth, fiscalYear);
        vm.fiscalYear = fiscalYear;
        vm.getDeliverableFeedback = getDeliverableFeedback;
        vm.gotData = false;
        vm.increaseDate = increaseDate;
        vm.rightPanelViewArray = ['modules/deliverables/views/deliverableFeedbackView.html', 'modules/deliverables/views/deliverableMetricsView.html'];
        vm.rightPanelView = vm.rightPanelViewArray[1];
        vm.showFeedbackPanel = false;
        vm.toggleRightPanel = toggleRightPanel;

        activate();

        /**==================PRIVATE==================*/

        function activate() {

            initializeMetricsGauges();

            $q.all([
                deliverablesService.getDeliverablesForMonth( fiscalYear, fiscalMonth ),
                deliverablesService.getDeliverableDefinitionsForMonth( fiscalYear, fiscalMonth ),
                deliverableFeedbackModel.getFyFeedback(fiscalYear)
            ])
                .then(function(resolvedPromises) {
                    vm.deliverablesByMonth = resolvedPromises[0];
                    vm.deliverableDefinitionsByMonth = resolvedPromises[1].deliverableDefinitionsByMonth;
                    vm.deliverableFeedback = resolvedPromises[2];
                    vm.gotData = true;
                });

            //deliverablesService.getDeliverableDefinitionsForMonth( fiscalYear, fiscalMonth )
            //    .then(function( results ) {
            //        vm.deliverableDefinitionsByMonth = results.deliverableDefinitionsByMonth;
            //    });
            //
            //deliverableFeedbackModel.getFyFeedback(fiscalYear)
            //    .then(function (results) {
            //        vm.deliverableFeedback = results;
            //    });
        }

        function getDeliverableFeedback(deliverableRecord) {
            vm.deliverableFeedback = deliverableRecord.getCachedFeedbackByDeliverableId();
            vm.rightPanelView = vm.rightPanelViewArray[0];
            vm.showFeedbackPanel = true;
        }

        function toggleRightPanel() {
            vm.rightPanelView = vm.rightPanelViewArray[1];
        }

        function initializeMetricsGauges() {

            vm.gauge1 = new chartService.Gauge('Satisfaction');
            vm.gauge2 = new chartService.Gauge('OTD');

            //TODO Add logic so we don't need to fake gauge values
            vm.gauge1.updateGaugeValue(chartService.getRandom());
            vm.gauge2.updateGaugeValue(chartService.getRandom());
        }

        /**
         * @name vm.deliverableFrequencyFilter
         * @description Find the definition for the provided deliverable and return the frequency.
         * @param {Deliverable} deliverable object.
         * @returns {string}
         */
        function deliverableFrequencyFilter( deliverable ) {
            var deliverableDefinition = deliverable.getDeliverableDefinition();
            if( deliverableDefinition ) {
                return deliverableDefinition.frequency.lookupValue;
            }
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

            $state.go('deliverables.main', {fy: updatedYear, mo: updatedMonth});
        }

        function decreaseDate() {
            var updatedMonth = fiscalMonth - 1;
            var updatedYear = fiscalYear;

            // if we're flipping to the previous year, decrement current fiscal year bucket
            if( updatedMonth === 0 ){
                updatedYear = updatedYear - 1;
                updatedMonth = 12;
            }

            $state.go('deliverables.main', {fy: updatedYear, mo: updatedMonth});
        }
    }
})();
