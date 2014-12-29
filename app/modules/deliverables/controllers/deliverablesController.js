(function () {
    'use strict';

    angular
        .module( 'pmam-deliverables' )
        .controller( 'deliverablesController', deliverablesController );

    /* @ngInject */
    function deliverablesController(chartService, $location, $scope, toastr, $state, deliverablesService) {

        var yearPart;
        var currentFiscalYear = 0;

        // uncomment below to use current year and month
        //var fiscalYear = moment().format('YYYY');
        //var currentMonth = moment().format('MM');

        var fiscalYear = '2013';
        var currentMonth = '7';

        if(currentMonth > 8) {
            fiscalYear++;
        }

        var fy = $state.params.fy || fiscalYear;
        var mo = $state.params.mo || currentMonth;
        var deliverableDefinitions;

        $scope.gotData = false;

        var monthNames = ["SEP","OCT","NOV","DEC","JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG"];

        fiscalYear = fy.substr(fy.length - 2);

        if( mo < 0 ) {
            mo = 11;
        }

        $scope.deliverableFrequencyFilter = deliverableFrequencyFilter;
        $scope.decreaseDate = decreaseDate;
        $scope.increaseDate = increaseDate;

        activate();

        /**==================PRIVATE==================*/

        function activate() {
            doBuildGauges();
            deliverablesService.getDeliverablesForMonth( fy, mo ).then(

                function( results ) {

                    $scope.deliverablesByMonth = results;

                    if($scope.deliverablesByMonth[0] !== undefined) {

                        fiscalYear = $scope.deliverablesByMonth[0].fy;
                        yearPart = fiscalYear.substr(fiscalYear.length - 2);
                        $scope.fiscalYear = fiscalYear;
                        $scope.displayPeriod = monthNames[$scope.deliverablesByMonth[0].month] + " " + yearPart;
                        currentMonth = $scope.deliverablesByMonth[0].month;
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

                        $scope.displayPeriod = monthNames[ mo ] + " " + fy.substr(fy.length - 2);

                    }

                },
                function(err) {
                    console.log(err);
                }
            );

            deliverablesService.getDeliverableDefinitionsForMonth( fy, mo ).then(

                function( results ) {

                    $scope.gotData = true;
                    $scope.deliverableDefinitionsByMonth = results.deliverableDefinitionsByMonth;
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
                function(err) {
                    console.log(err);
                }
            );

        }

        function initializeMetricsGauages() {

            $scope.metricsByMonth = doPrepareMetrics();

            // faking the gauge data for now; it should run off the values returned in metricsByMonth
            $scope.Gauge1.data.rows[0].c[1].v = chartService.getRandom();
            $scope.Gauge2.data.rows[0].c[1].v = chartService.getRandom();
        }

        function doBuildGauges() {

            var gauges = chartService.buildGauges();

            //Create initial gauge objects if not already defined
            $scope.Gauge1 = gauges.Gauge1;
            $scope.Gauge2 = gauges.Gauge2;
        }

        function doPrepareMetrics() {

            return chartService.prepareMetrics($scope.deliverablesByMonth);

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
