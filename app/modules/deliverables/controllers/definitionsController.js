(function () {
    'use strict';

    // controller returning deliverable types

    angular
        .module('pmam-deliverables')
        .controller('definitionsController', definitionsController);

    /* @ngInject */
    function definitionsController($state, $scope, deliverableDefinitionsModel, deliverablesService) {

        var vm = this;
        var fy = $state.params.fy || '2013';

        vm.fiscalYear = fy;
        vm.gotData = false;
        vm.state = {
            definitions: [],
            validChartData: 'false',
            searchString: ''
        };

        activate();


        /**==================PRIVATE==================*/

        function activate() {

            deliverableDefinitionsModel.getFyDefinitions(fy)
                .then(function (result) {

                    vm.deliverableDefinitions = result.toArray();
                    vm.state.validChartData = true;

                }),
                function(err) {
                    console.log(err);
                }

            deliverablesService.getDeliverableCountByDefinition(fy).then(function(deliverableCountByDefinition){
                vm.deliverableCountByDefinition = deliverableCountByDefinition;
            });
        }
    }
})();
