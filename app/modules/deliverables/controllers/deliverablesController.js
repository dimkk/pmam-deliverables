(function () {
    'use strict';

    // home page controller
    angular
        .module( 'pmam-deliverables' )
        .controller( 'deliverablesController', deliverablesController );

    function deliverablesController(deliverableFeedbackModel, chartService, $state,
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
        vm.rightPanelView = 'modules/deliverables/views/deliverableMetricsView.html';
        vm.showFeedbackPanel = false;
        vm.toggleRightPanel = toggleRightPanel;

        activate();

        /**==================PRIVATE==================*/

        function activate() {

            initializeMetricsGauges();

            deliverablesService.getDeliverablesForMonth( fiscalYear, fiscalMonth )
                .then( function( results ) {
                    vm.deliverablesByMonth = results;
                });

            deliverablesService.getDeliverableDefinitionsForMonth( fiscalYear, fiscalMonth )
                .then(function( results ) {
                    vm.deliverableDefinitionsByMonth = results.deliverableDefinitionsByMonth;
                });

            deliverableFeedbackModel.getFyFeedback(fiscalYear)
                .then(function (results) {
                    vm.deliverableFeedback = results;
                });
        }

        function getDeliverableFeedback(deliverableRecord) {
            vm.deliverableFeedback = deliverableRecord.getCachedFeedbackByDeliverableId();
            vm.rightPanelView = 'modules/deliverables/views/deliverableFeedbackView.html';
            vm.showFeedbackPanel = true;
        }

        function toggleRightPanel() {
            vm.rightPanelView = 'modules/deliverables/views/deliverableMetricsView.html';
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
