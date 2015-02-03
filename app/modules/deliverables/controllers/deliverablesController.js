(function () {
    'use strict';

    // home page controller

    angular
        .module( 'pmam-deliverables' )
        .controller( 'deliverablesController', deliverablesController );

    /* @ngInject */
    function deliverablesController(deliverablesModel, deliverableFeedbackService, chartService, $scope, $state, deliverablesService) {

        var vm = this;

        /** $state query string params return as strings, if they exist and can be converted to an int do it, otherwise use the current fiscal year and month */
        var fiscalYear = isNaN($state.params.fy) ? getCurrentFiscalYear() : parseInt($state.params.fy);
        var fiscalMonth = isNaN($state.params.mo) ? getCurrentFiscalMonth() : parseInt($state.params.mo);
        var deliverableDefinitions;

        vm.decreaseDate = decreaseDate;
        vm.deliverableFrequencyFilter = deliverableFrequencyFilter;
        vm.displayPeriod = generateDisplayPeriod();
        vm.getDeliverableFeedback = getDeliverableFeedback;
        vm.gotData = false;
        vm.increaseDate = increaseDate;
        vm.rightPanelView = vm.showFeedbackPanel ? 'modules/deliverables/views/deliverableFeedbackView.html' : 'modules/deliverables/views/deliverableMetricsView.html';
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
                    $scope.deliverableFrequencies = results;

                }
            );

            deliverableFeedbackService.getDeliverableFeedback().then(
                function (results) {
                    vm.deliverableFeedback = results;
                    vm.gotData = true;
                }
            );

        }

        function getDeliverableFeedback(Id) {

            var deliverableRecord = deliverablesModel.getCachedEntity(parseInt(Id));
            vm.deliverableFeedback = deliverableRecord.getCachedFeedbackByDeliverableId();
            vm.rightPanelView = 'modules/deliverables/views/deliverableFeedbackView.html';
            vm.showFeedbackPanel = true;

        }

        function toggleRightPanel() {
            vm.rightPanelView = 'modules/deliverables/views/deliverableMetricsView.html';
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

        function getCurrentFiscalYear() {
            var today = new Date();
            return today.getMonth() < 3 ? today.getFullYear() : today.getFullYear() - 1;

        }
        function getCurrentFiscalMonth() {
            var calendarMonthNumber = new Date().getMonth() - 2;
            if(calendarMonthNumber <= 0) {
                calendarMonthNumber = calendarMonthNumber + 12;
            }
            return calendarMonthNumber
        }

        function generateDisplayPeriod() {
            var monthNames = ["OCT","NOV","DEC","JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP"],
                calendarYear = fiscalMonth < 4 ? fiscalYear - 1 : fiscalYear,
                twoDigitYear = (calendarYear.toString()).substr(2);
                //Month is (1-12) so we need to add 1 to find value in 0 based monthName array
                return monthNames[fiscalMonth - 1] + " " + twoDigitYear
        }
    }
})();
