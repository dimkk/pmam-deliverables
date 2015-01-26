(function () {
    'use strict';

    // controller returning deliverable types

    angular
        .module('pmam-deliverables')
        .controller('definitionsController', definitionsController);

    /* @ngInject */
    function definitionsController($state, $scope, deliverableDefinitionsModel, deliverablesService) {

        var fy = $state.params.fy || '2013';

        $scope.fiscalYear = fy;
        $scope.gotData = false;
        $scope.state = {
            definitions: [],
            validChartData: 'false',
            searchString: ''
        };

        activate();


        /**==================PRIVATE==================*/

        function activate() {

            deliverableDefinitionsModel.getFyDefinitions(fy)
                .then(function (result) {

                    $scope.deliverableDefinitions = result.toArray();
                    $scope.state.validChartData = true;

                }),
                function(err) {
                    console.log(err);
                }

            deliverablesService.getDeliverableCountByDefinition(fy).then(function(deliverableCountByDefinition){
                $scope.deliverableCountByDefinition = deliverableCountByDefinition;
            });
        }
    }
})();
