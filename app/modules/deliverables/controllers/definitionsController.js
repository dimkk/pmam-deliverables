(function () {
    'use strict';

    // controller returning deliverable types

    angular
        .module('pmam-deliverables')
        .controller('definitionsController', definitionsController);

    /* @ngInject */
    function definitionsController($state, $scope, deliverableDefinitionsModel, deliverablesService, calendarService) {

        var vm = this;
        var fy = isNaN($state.params.fy) ? calendarService.getCurrentFiscalYear() : parseInt($state.params.fy);

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
