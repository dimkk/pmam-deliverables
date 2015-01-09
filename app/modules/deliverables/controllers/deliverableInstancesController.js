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

            doBuildGauges();

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
            })

        }

        function getUpdateState(){
            $state.go('deliverables.instances',{ fy: fy, id: $scope.state.selectedDeliverable.id } )
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

    }
})();
