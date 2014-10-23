(function () {
    'use strict';

    angular
        .module('pmam-deliverables')
        .controller('deliverablesCtrl', deliverablesCtrl);

    /* @ngInject */
    function deliverablesCtrl($scope, _, toastr, apDataService, deliverablesModel, deliverableDefinitionsModel,
                              deliverableFrequenciesModel, deliverableFeedbackModel, $location, $stateParams,
                              chartService, $timeout) {
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
            },
            deliverables;

        $scope.changeViewMode = changeViewMode;
        $scope.decreaseDate = decreaseDate;
        $scope.increaseDate = increaseDate;
        $scope.openDefinitionsForm = openDefinitionsForm;
        $scope.openDeliverablesForm = openDeliverablesForm;
        $scope.state = state;
        $scope.deliverablesByMonth = {};

        activate();

        ////////////////

        function activate() {
            deliverablesModel.executeQuery()
                .then(function (indexedCache) {
                    deliverables = indexedCache;
                    prepareMetrics();
                    buildGauges();
                    $scope.Gauge1.data.rows[0].c[1].v = 4.3;
                    $scope.Gauge2.data.rows[0].c[1].v = 3.1;
                    $scope.Gauge3.data.rows[0].c[1].v = 4.9;
                });
        }

        function changeViewMode(item) {
            console.log(item);
        }

        function increaseDate() {
            var currentMonthIndex = state.availableMonths.indexOf(state.displayDate);
            if (currentMonthIndex === 0) {
                toastr.info("There are no newer records to display.")
            } else if (currentMonthIndex === -1) {
                toastr.error("There was a problem with your request.  Please try again.")
            } else {
                state.displayDate = state.availableMonths[currentMonthIndex - 1];
            }
        }

        function openDeliverablesForm(deliverable) {
            if (deliverable) {
                $stateParams.id = deliverable.id;
                $location.path("/deliverable/" + $stateParams.id);
            }
            else {
                $location.path("/deliverable");
            }
        }

        function openDefinitionsForm(deliverable) {
            $location.path("/definitions");
        }

        function decreaseDate() {
            var currentMonthIndex = state.availableMonths.indexOf(state.displayDate);
            if (currentMonthIndex === (state.availableMonths.length - 1)) {
                toastr.info("There are no older records to display.")
            } else if (currentMonthIndex === -1) {
                toastr.error("There was a problem with your request.  Please try again.")
            } else {
                state.displayDate = state.availableMonths[currentMonthIndex + 1];
            }
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
                cssStyle: "width: 350px; height: 300px; display: inline-block; vertical-align: top; position: relative;",
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
                cssStyle: "width: 350px; height: 300px; display: inline-block; vertical-align: top; position: relative;",
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
                cssStyle: "width: 350px; height: 300px; display: inline-block; vertical-align: top; position: relative;",
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
            $scope.deliverablesByMonth = {};
            //Clear out any monthly data
            state.availableMonths.length = 0;
            //Add references to each metric broken out by date
            _.each(deliverables, function (deliverable) {

                //Sets initial date to the most recent display date
                state.displayDate = deliverable.displayDate;

                //Create array to hold metrics for this month if it doesn't exist
                $scope.deliverablesByMonth[deliverable[state.displayMode]] = $scope.deliverablesByMonth[deliverable[state.displayMode]] || []
                $scope.deliverablesByMonth[deliverable[state.displayMode]].push(deliverable);

            });
            _.each($scope.deliverablesByMonth, function (monthMetrics, monthLabel) {
                state.availableMonths.push(monthLabel);
            });
            console.log($scope.deliverablesByMonth);
            state.validChartData = true;
        }

    }
})();
