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

        var state = {
            displayDate: 'loading',
            selectedDivision: '',
            selectedTeam: '',
            showDivisions: false,
            viewModeMonth: true,
            displayMode: "displayDate",
            title: "Deliverables",
            monthActive: 'active',
            qtrActive: null,
            displayedTitle: '',
            validChartData: false,
            availableMonths: []
        }

        activate();

        /**==================PRIVATE==================*/

        function activate() {
            buildGauges();
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

            prepareMetrics();

            $scope.Gauge1.data.rows[0].c[1].v = getRandom();
            $scope.Gauge2.data.rows[0].c[1].v = getRandom();
            $scope.Gauge3.data.rows[0].c[1].v = getRandom();
        }

        function getRandom() {
            return Math.floor(Math.random() * 5) + 1;
        }

        function buildGauges() {
            //Create initial gauge objects if not already defined
            $scope.Gauge1 = new chartService.GaugeChart({
                options: {
                    animation: {
                        easing: 'out',
                        duration: 1000
                    }
                },
                data: {
                    rows: [
                        {
                            "c": [
                                {"v": 'Satisfaction', "p": {}},
                                {"v": 0, "p": {}}
                            ]
                        }
                    ]
                }
            });
            $scope.Gauge2 = new chartService.GaugeChart({
                options: {
                    animation: {
                        easing: 'out',
                        duration: 1000
                    }
                },
                data: {
                    rows: [
                        {
                            "c": [
                                {"v": 'Health', "p": {}},
                                {"v": 0, "p": {}}
                            ]
                        }
                    ]
                }
            });
            $scope.Gauge3 = new chartService.GaugeChart({
                options: {
                    animation: {
                        easing: 'out',
                        duration: 1000
                    }
                },
                data: {
                    rows: [
                        {
                            "c": [
                                {"v": 'OTD', "p": {}},
                                {"v": 0, "p": {}}
                            ]
                        }
                    ]
                }
            });
        }

        function prepareMetrics() {
            $scope.metricsByMonth = {};
            //Clear out any monthly data
            state.availableMonths.length = 0;
            //Add references to each metric broken out by date
            console.log($scope.deliverablesByMonth);
            _.each($scope.deliverablesByMonth, function (deliverable) {

                //Sets initial date to the most recent display date
                state.displayDate = deliverable.displayDate;

                console.log(state.displayDate);
                //Create array to hold metrics for this month if it doesn't exist
                $scope.metricsByMonth[deliverable[state.displayMode]] = $scope.metricsByMonth[deliverable[state.displayMode]] || []
                $scope.metricsByMonth[deliverable[state.displayMode]].push(deliverable);

            });
            _.each($scope.metricsByMonth, function (monthMetrics, monthLabel) {
                state.availableMonths.push(monthLabel);
            });

            console.log($scope.metricsByMonth);
            state.validChartData = true;
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
