(function () {
    'use strict';

    angular
        .module( 'pmam-deliverables' )
        .controller( 'deliverablesController', deliverablesController );

    /* @ngInject */
    function deliverablesController( $location, $scope, toastr, $state, deliverablesService ) {

        $scope.decreaseDate = decreaseDate;
        $scope.increaseDate = increaseDate;

        activate();

        /**==================PRIVATE==================*/

        function activate() {

            deliverablesService.getDeliverables().then(
                function(results) {
                    $scope.deliverablesByMonth = results;
                    $scope.displayDate = results.state.displayDate;
                    $scope.state = results.state;
                },
                function(err) {
                    console.log(err);
                }
            );

            deliverablesService.getDeliverableDefinitions().then(
                function(results) {
                    $scope.deliverableDefinitions = results;
                    debugger;
                },
                function(err) {
                    console.log(err);
                }
            );

            deliverablesService.getDeliverableFrequencies().then(
                function(results) {
                    $scope.deliverableFrequencies = results;
                    debugger;
                },
                function(err) {
                    console.log(err);
                }
            );

        }

        function getDeliverablesByMonth() {

            var fy = $state.fy || '2013';

            deliverablesService.getDeliverables().then(function(results) {

                $scope.allMyDeliverables = results;
                console.log(results);

            });
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


    }
})();
