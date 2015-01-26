(function () {
    'use strict';

    // deliverables instances controller

    angular
        .module('pmam-deliverables')
        .controller('deliverableInstancesController', deliverableInstancesController);

    /* @ngInject */
    function deliverableInstancesController(deliverablesModel, $q, deliverableFeedbackModel, chartService, $scope, $location, $state, _, deliverablesService, deliverableDefinitionsModel, deliverableFeedbackService) {

        var fy = $state.params.fy || '2013';
        var activeId = $state.params.id;

        $scope.state = {selectedDeliverable: null};
        $scope.getUpdateState = getUpdateState;
        $scope.getDeliverableFeedback = getDeliverableFeedback;
        $scope.showFeedback = false;
        $scope.rightPanelView = 'modules/deliverables/views/deliverableMetricsView.html';
        $scope.gotData = false;
        $scope.toggleRightPanel = toggleRightPanel;

        activate();

        /**==================PRIVATE==================*/

        function activate() {

            doBuildGauges();

            $q.all([deliverableDefinitionsModel.getFyDefinitions(fy), deliverableFeedbackModel.executeQuery()])
                .then(function (resolvedPromises) {

                    var indexedCache = resolvedPromises[0];

                if(!activeId){
                    $scope.state.selectedDeliverable = indexedCache.first();
                    deliverablesService.getDeliverablesByType(fy, parseInt($scope.state.selectedDeliverable.id)).then
                    (function (indexedCached) {
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

            deliverableFeedbackService.getDeliverableFeedback().then(
                function (results) {
                    $scope.deliverableFeedback = results;

                },
                function (err) {
                    console.log(err);
                }
            );
        }

        function getUpdateState(){
            $state.go('deliverables.instances', {fy: fy, id: $scope.state.selectedDeliverable.id})
        }

        function getDeliverableFeedback(Id) {

            $scope.deliverableRecord = deliverablesModel.getCachedEntity(parseInt(Id));
            $scope.deliverableFeedback = $scope.deliverableRecord.getCachedFeedbackByDeliverableId();
            $scope.rightPanelView = 'modules/deliverables/views/deliverableFeedbackView.html';
        }

        function toggleRightPanel() {
            $scope.rightPanelView = 'modules/deliverables/views/deliverableMetricsView.html';
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
