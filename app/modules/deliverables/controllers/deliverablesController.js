(function () {
    'use strict';

    // home page controller

    angular
        .module( 'pmam-deliverables' )
        .controller( 'deliverablesController', deliverablesController );

    /* @ngInject */
    function deliverablesController(deliverablesModel, deliverableFeedbackService, chartService, $location, $scope, toastr, $state, deliverablesService) {

        var yearPart;
        var currentFiscalYear = 0;

        // uncomment below to use current year and month
        //var fiscalYear = moment().format('YYYY');
        //var currentMonth = moment().format('MM');

        var fiscalYear = '2013';
        var currentMonth = '7';
        var vm = this;

        if(currentMonth > 8) {
            fiscalYear++;
        }

        var fy = $state.params.fy || fiscalYear;
        var mo = $state.params.mo || currentMonth;
        var deliverableDefinitions;

        vm.gotData = false;

        var monthNames = ["SEP","OCT","NOV","DEC","JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG"];

        fiscalYear = fy.substr(fy.length - 2);

        if( mo < 0 ) {
            mo = 11;
        }

        vm.deliverableFrequencyFilter = deliverableFrequencyFilter;
        vm.getDeliverableFeedback = getDeliverableFeedback;
        vm.decreaseDate = decreaseDate;
        vm.increaseDate = increaseDate;
        vm.rightPanelView = vm.showFeedbackPanel ? 'modules/deliverables/views/deliverableFeedbackView.html' : 'modules/deliverables/views/deliverableMetricsView.html';
        vm.toggleRightPanel = toggleRightPanel;

        activate();

        /**==================PRIVATE==================*/

        function activate() {

            doBuildGauges();

            deliverablesService.getDeliverablesForMonth( fy, mo ).then(

                function( results ) {

                    vm.deliverablesByMonth = results;

                    if (vm.deliverablesByMonth[0] !== undefined) {

                        fiscalYear = vm.deliverablesByMonth[0].fy;
                        yearPart = fiscalYear.substr(fiscalYear.length - 2);
                        vm.fiscalYear = fiscalYear;
                        vm.displayPeriod = monthNames[vm.deliverablesByMonth[0].month] + " " + yearPart;
                        currentMonth = vm.deliverablesByMonth[0].month;
                        initializeMetricsGauages();
                    }

                    // this is where we handle increments and decrements when there's no data
                    else {

                        if( mo > 11 ){
                            mo = 0;
                        }
                        if( mo < 0 ){
                            mo = 11;
                        }

                        vm.displayPeriod = monthNames[mo] + " " + fy.substr(fy.length - 2);

                    }

                },
                function(err) {
                    console.log(err);
                }
            );

            deliverablesService.getDeliverableDefinitionsForMonth( fy, mo ).then(

                function( results ) {

                    vm.deliverableDefinitionsByMonth = results.deliverableDefinitionsByMonth;
                    deliverableDefinitions = results.deliverableDefinitions;

                },
                function(err) {
                    console.log(err);
                }
            );

            deliverablesService.getDeliverableFrequencies().then(

                function(results) {
                    $scope.deliverableFrequencies = results;

                },
                function (err) {
                    console.log(err);
                }
            );

            deliverableFeedbackService.getDeliverableFeedback().then(
                function (results) {
                    vm.deliverableFeedback = results;
                    vm.gotData = true;

                },
                function(err) {
                    console.log(err);
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

        function initializeMetricsGauages() {

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

        // 9/1 starts the new fiscal year
        function increaseDate() {

            currentMonth = parseInt(mo) + 1;
            currentFiscalYear = fy;

            // if we're flipping to the new year, increment current fiscal year bucket
            if( currentMonth === 4 ) {
                currentFiscalYear = parseInt(currentFiscalYear) + 1;
                currentFiscalYear = currentFiscalYear.toString();
            }

            // fetch the filtered data
            $location.search( 'fy', currentFiscalYear );
            $location.search( 'mo',  currentMonth );

        }

        // this is a stub for navigating to a form to manage definitions
        function openDefinitionsForm(deliverable) {
            $location.path("/definitions");
        }

        function decreaseDate() {

            currentMonth = parseInt(mo) - 1;
            currentFiscalYear = fy;

            // if we're flipping to the previous year, decrement current fiscal year bucket
            if( currentMonth === 3 ) {
                currentFiscalYear = parseInt(currentFiscalYear) - 1;
                currentFiscalYear = currentFiscalYear.toString();
            }

            if( currentMonth === 0 ){
                currentMonth = 12;
            }

            $location.search( 'fy', currentFiscalYear );
            $location.search( 'mo', currentMonth );
        }
    }
})();
