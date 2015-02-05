(function () {
    'use strict';

    // home page controller

    angular
        .module( 'pmam-deliverables' )
        .controller( 'deliverablesController', deliverablesController );

    /* @ngInject */
    function deliverablesController(deliverablesModel, deliverableFeedbackService, chartService, $state,
                                    deliverablesService, calendarService) {

        var vm = this;

        /** $state query string params return as strings, if they exist and can be converted to an int do it, otherwise use the current fiscal year and month */
        var fiscalYear = isNaN($state.params.fy) ? calendarService.getCurrentFiscalYear() : parseInt($state.params.fy);
        var fiscalMonth = isNaN($state.params.mo) ? calendarService.getCurrentFiscalMonth() : parseInt($state.params.mo);
        var deliverableDefinitions;

        vm.decreaseDate = decreaseDate;
        vm.deliverableFrequencyFilter = deliverableFrequencyFilter;
        vm.displayPeriod = calendarService.generateDisplayPeriod(fiscalMonth, fiscalYear);
        vm.getDeliverableFeedback = getDeliverableFeedback;
        vm.gotData = false;
        vm.increaseDate = increaseDate;
        vm.rightPanelViewArray = ['modules/deliverables/views/deliverableFeedbackView.html', 'modules/deliverables/views/deliverableMetricsView.html'];
        vm.rightPanelView = vm.showFeedbackPanel ? vm.rightPanelViewArray[0] : vm.rightPanelViewArray[1];
        vm.toggleRightPanel = toggleRightPanel;

        activate();

        /**==================PRIVATE==================*/

        function activate() {

            doBuildGauges();

            deliverablesService.getDeliverablesForMonth( fiscalYear, fiscalMonth ).then(

                function( results ) {
                    vm.deliverablesByMonth = results;
                    initializeMetricsGauges();
                }
            );

            deliverablesService.getDeliverableDefinitionsForMonth( fiscalYear, fiscalMonth ).then(
                function( results ) {

                    vm.deliverableDefinitionsByMonth = results.deliverableDefinitionsByMonth;
                    deliverableDefinitions = results.deliverableDefinitions;
                }
            );

            //TODO Refactor to use the deliverableFrequenciesService instead
            deliverablesService.getDeliverableFrequencies().then(
                function(results) {

                    vm.deliverableFrequencies = results;
                }
            );

            deliverableFeedbackService.getDeliverableFeedback().then(
                function (results) {
                    vm.deliverableFeedback = results;
                    vm.gotData = true;
                }
            );

        }

        function getDeliverableFeedback(id) {

            var deliverableRecord = deliverablesModel.getCachedEntity(parseInt(id));
            vm.deliverableFeedback = deliverableRecord.getCachedFeedbackByDeliverableId();
            vm.rightPanelView = vm.rightPanelViewArray[0];
            vm.showFeedbackPanel = true;

        }

        function toggleRightPanel() {
            vm.rightPanelView = vm.rightPanelViewArray[1];
        }

        function initializeMetricsGauges() {

            vm.metricsByMonth = doPrepareMetrics();

            // faking the gauge data for now; it should run off the values returned in metricsByMonth
            vm.Gauge1.data.rows[0].c[1].v = chartService.getRandom();
            vm.Gauge2.data.rows[0].c[1].v = chartService.getRandom();
        }

        function doBuildGauges() {

            var gauges = chartService.buildGauges();

            //Create initial gauge objects if not already defined
            vm.Gauge1 = gauges.Gauge1;
            vm.Gauge2 = gauges.Gauge2;
        }

        function doPrepareMetrics() {
            return chartService.prepareMetrics(vm.deliverablesByMonth);

        }

        function deliverableFrequencyFilter( deliverableType ) {

            var deliverableDefinition = deliverableDefinitions[ deliverableType.lookupId ];

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
