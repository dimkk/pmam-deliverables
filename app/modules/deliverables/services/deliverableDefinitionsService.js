/**
 * Created by scahall on 11/12/2014.
 */
'use strict';

angular.module('pmam-deliverables').factory('deliverableDefinitionsService', ['$q', 'apDataService', 'deliverablesModel', 'deliverableDefinitionsModel',
    'deliverableFrequenciesModel', 'deliverableFeedbackModel', function($q, apDataService, deliverablesModel, deliverableDefinitionsModel,
                                                                        deliverableFrequenciesModel, deliverableFeedbackModel) {

        var deliverables = {};
        var deliverableFrequencies = {};
        var deliverableDefinitions = {};

//    1.  make a request to the server for all available deliverables for the current FY
            function getDeliverablesData() {

                $q.all([deliverablesModel.executeQuery(), deliverableFrequenciesModel.executeQuery(), deliverableDefinitionsModel.executeQuery()])
                    .then(function (resolvedPromises) {

                        deliverables = resolvedPromises[0];
                        deliverableFrequencies = resolvedPromises[1];
                        deliverableDefinitions = resolvedPromises[2];
                        return deliverables;
                    });
            }

//    2.  make a request to the server for all available deliverable frequencies

//    3.  create a function that accepts a month and year and returns applicable definitions for a given month/year

//    4.  create a function that generates array of objects based on the filter returned from step 3
//          and define the set of deliverable definitions for the current month that have not yet been submitted.

}]);
