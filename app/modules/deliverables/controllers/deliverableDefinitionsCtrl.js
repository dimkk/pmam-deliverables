(function () {
    'use strict';

    angular
        .module('pmam-deliverables')
        .controller('deliverableDefinitionsCtrl', deliverableDefinitionsCtrl);

    /* @ngInject */
    function deliverableDefinitionsCtrl($scope, _, apDataService, deliverablesModel, deliverableDefinitionsModel,
                                        deliverableFrequenciesModel, deliverableFeedbackModel, $location, $stateParams,
                                        chartService, $timeout) {
        activate();

        ////////////////

        function activate() {
            deliverableDefinitionsModel.executeQuery()
                .then(function (deliverableDefinitions) {

                    getDeliverableDefinitions(deliverableDefinitions);
                    $scope.state.validChartData = 'true';
                });
        }

        $scope.state = {
            definitions: [],
            validChartData: 'false'
        };

        $scope.openDefinitionsForm = openDefinitionsForm;
        $scope.parseUserItem = parseUserItem;

        function getDeliverableDefinitions(deliverableDefinitions) {
            _.each(deliverableDefinitions, function (definition) {
                $scope.state.definitions.push(definition);
            });
        }

        function openDefinitionsForm(definition) {
            if (definition) {
                $stateParams.id = definition.id;
                $location.path("/definitions/" + $stateParams.id);
            }
            else {
                $location.path("/definitions");
            }
        }

        function parseUserItem(items) {
            var returnString = '';
            _.each(items, function (item) {
                if (returnString.length > 1) {
                    returnString += ', ' + item.lookupValue;
                }
                else {
                    returnString += item.lookupValue;

                }
            });
            return returnString;

        }

    }
})();
