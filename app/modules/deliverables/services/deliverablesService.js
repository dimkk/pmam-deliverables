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

        var service = {
            getDeliverablesForMonth: getDeliverablesForMonth,
            getDeliverableFrequencies: getDeliverableFrequencies,
            getDeliverableDefinitionsForMonth: getDeliverableDefinitionsForMonth,
            getDeliverablesByType: getDeliverablesByType,
            getDeliverableCountByDefinition: getDeliverableCountByDefinition
        };

        return service;


//    4.  create a function that generates array of objects based on the filter returned from step 3
//          and define the set of deliverable definitions for the current month that have not yet been submitted.


        /**==================PRIVATE==================*/


//    2.  make a request to the server for all available deliverable frequencies

        function getDeliverableFrequencies() {

            var deferred = $q.defer();

            deliverableFrequenciesModel.executeQuery()
                .then(function( deliverableFrequencies ){

                    deferred.resolve( deliverableFrequencies );
                });

            return deferred.promise;
        }

//    3. TODO:  create a function that accepts a month and year and returns applicable definitions for a given month/year

        function getDeliverableDefinitionsForMonth( fy, mo ) {

            var deferred = $q.defer();

            deliverableDefinitionsModel.getFyDefinitions(fy)
                .then(function( deliverableDefinitions ){

                    var deliverableDefinitionsByMonth = {};

                    _.each(deliverableDefinitions, function( deliverableDefinition ) {

                        var activeDefinition = filterDefinitionsByFrequency( deliverableDefinition, mo );

                        if( activeDefinition ) {
                            deliverableDefinitionsByMonth[ deliverableDefinition.id ] = deliverableDefinition;
                        }

                    } );

                    deferred.resolve( { deliverableDefinitions: deliverableDefinitions, deliverableDefinitionsByMonth: deliverableDefinitionsByMonth } );
                });

            return deferred.promise;
        }

        function filterDefinitionsByFrequency( deliverableDefinition, mo ) {

            var result = false;

            // check for eligible frequencies
            switch( deliverableDefinition.frequency.lookupId.toString() ) {

                case "1":   // monthly
                    result = true;
                    break;

                case "3":  // bi-monthly
                    if( parseInt(mo) % 2 ){
                        result = true;
                        break;
                    }

                case "4":  // one off
                    if( deliverableDefinition.hardDate.length ){
                        var dateToParse = new Date( deliverableDefinition.hardDate );
                        var hardDateMonth = dateToParse.getMonth();
                        if( hardDateMonth === mo ) {
                            result = true;
                            break;
                        }
                    }
            }

            return result;
        }

// year / mo combination

//  function to return promise for month

        function getDeliverablesForMonth( fy, month ) {

            var deferred = $q.defer();

            deliverablesModel.getFyDeliverables(fy)
                .then(function (indexedCache) {
                    var deliverablesForMonth = _.where(indexedCache, function(deliverable) {
                        return deliverable.month === month.toString();
                    });
                    deferred.resolve(deliverablesForMonth);
                });
            return deferred.promise;
        }

        // a function that returns just the detail instances of a particular deliverable

        function getDeliverablesByType(fy, typeId) {

            var deferred = $q.defer();

            deliverablesModel.getFyDeliverables(fy)
                .then(function (indexedCache) {
                    var deliverablesByType = _.where(indexedCache, function(deliverable) {
                        return deliverable.deliverableType.lookupId === typeId;
                    });
                    deferred.resolve(deliverablesByType);
                });
            return deferred.promise;
        }

        function getDeliverableCountByDefinition(fy) {

            var deferred = $q.defer();

            deliverablesModel.getFyDeliverables(fy)
                .then(function (indexedCache) {
                   var deliverableCountByDefinition = {};
                    _.each(indexedCache,function(deliverable){
                        deliverableCountByDefinition[deliverable.deliverableType.lookupId] = deliverableCountByDefinition[deliverable.deliverableType.lookupId] || 0;
                        deliverableCountByDefinition[deliverable.deliverableType.lookupId]++;
                    })
                    deferred.resolve(deliverableCountByDefinition);
                });

            return deferred.promise;
        }

        function getDeliverableDefinitions(fy) {

            var deferred = $q.defer();

            deliverableDefinitionsModel.getFyDefinitions(fy)
                .then(function( indexedCache ){

                    deferred.resolve( indexedCache );
                });

            return deferred.promise;
        }

    }
})();
