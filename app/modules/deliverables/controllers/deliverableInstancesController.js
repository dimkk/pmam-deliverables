(function () {
    'use strict';

    angular
        .module('pmam-deliverables')
        .controller('deliverableInstancesController', deliverableInstancesController);

    /* @ngInject */
    function deliverableInstancesController(chartService, $scope, $location, $state, _, deliverablesService, deliverableDefinitionsModel) {

        var fy = $state.params.fy || '2013';
        var activeId = $state.params.id;

        $scope.state = {selectedDeliverable: null};
        $scope.getUpdateState = getUpdateState;

        $scope.gotData = false;

        activate();


        /**==================PRIVATE==================*/

        function activate() {

            buildGauges();

            deliverableDefinitionsModel.getFyDefinitions(fy).then(function(indexedCache){

                if(!activeId){
                    $scope.state.selectedDeliverable = indexedCache.first();
                    deliverablesService.getDeliverablesByType(fy,parseInt($scope.state.selectedDeliverable.id)).then(function(indexedCached){
                        $scope.deliverableInstances = indexedCached;
                    })
                } else {

                    $scope.state.selectedDeliverable = indexedCache[ parseInt(activeId) ];
                }
                $scope.frequency = $scope.state.selectedDeliverable.frequency.lookupValue;
                $scope.deliverableDefinitions = indexedCache.toArray();
                $scope.gotData = true;

                if(activeId) {
                    deliverablesService.getDeliverablesByType(fy,parseInt(activeId)).then(function(indexedCached){
                        $scope.deliverableInstances = indexedCached;
                    })
                }
                initializeMetricsGauages();
            });


        }

        function getUpdateState(){
            $state.go('deliverables.instances',{ fy: fy, id: $scope.state.selectedDeliverable.id } )
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


    }
})();
