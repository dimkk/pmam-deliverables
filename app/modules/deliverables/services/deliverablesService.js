(function () {
    'use strict';

    angular
        .module('pmam-deliverables')
        .factory('deliverablesService', deliverablesService);

    /**
     * @ngdoc service
     * @name deliverablesService
     * @description
     *
     */
    function deliverablesService(_, $q, deliverablesModel, deliverableDefinitionsModel, deliverableFrequenciesModel, deliverableFeedbackModel) {


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
        };

        var service = {
            getDeliverables: getDeliverables,
            getDeliverableFrequencies: getDeliverableFrequencies,
            getDeliverableDefinitions: getDeliverableDefinitions
        };

        return service;


//    4.  create a function that generates array of objects based on the filter returned from step 3
//          and define the set of deliverable definitions for the current month that have not yet been submitted.


        /**==================PRIVATE==================*/


//    1.  make a request to the server for all available deliverables for the current FY

        function getDeliverables() {

            return prepareMetrics(deliverablesModel.executeQuery());

        }


//    2.  make a request to the server for all available deliverable frequencies

        function getDeliverableFrequencies() {

            var deferred = $q.defer();

            deliverableFrequenciesModel.executeQuery()
                .then(function(deliverableFrequencies){
                    deferred.resolve(deliverableFrequencies);
                });

            return deferred.promise;
        }

//    3. TODO:  create a function that accepts a month and year and returns applicable definitions for a given month/year

        function getDeliverableDefinitions() {

            var deferred = $q.defer();

            deliverableDefinitionsModel.executeQuery()
                .then(function(deliverableDefinitions){
                    deferred.resolve(deliverableDefinitions);
                });

            return deferred.promise;
        }


        function prepareMetrics( deliverablesPromise ) {

            var deferred = $q.defer();
            var deliverablesByMonth = {};

            deliverablesPromise
                .then(function(deliverables){

                    //Clear out any monthly data
                    state.availableMonths.length = 0;

                    //Add references to each metric broken out by date
                    _.each(deliverables, function (deliverable) {

                        //Sets initial date to the most recent display date
                        state.displayDate = deliverable.displayDate;

                        //Create array to hold metrics for this month if it doesn't exist
                        deliverablesByMonth[deliverable[state.displayMode]] = deliverablesByMonth[deliverable[state.displayMode]] || [];
                        deliverablesByMonth[deliverable[state.displayMode]].push(deliverable);

                    });

                    _.each(deliverablesByMonth, function (monthMetrics, monthLabel) {
                        state.availableMonths.push(monthLabel);
                    });

                    state.validChartData = true;
                    deliverablesByMonth.state = state;

                    deferred.resolve(deliverablesByMonth);

                })

            return deferred.promise;
        }


        function getDeliverablesData() {

            var deliverables = {};
            var deliverableFrequencies = {};
            var deliverableDefinitions = {};

            $q.all([deliverablesModel.executeQuery(), deliverableFrequenciesModel.executeQuery(), deliverableDefinitionsModel.executeQuery()])
                .then(function (resolvedPromises) {

                    deliverables = resolvedPromises[0];
                    deliverableFrequencies = resolvedPromises[1];
                    deliverableDefinitions = resolvedPromises[2];
                    return deliverables;
                });
        }

    }
})();
