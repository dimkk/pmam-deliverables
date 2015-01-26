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

        //    get all available deliverables for the current FY

            function getDeliverablesData() {

                $q.all([deliverablesModel.executeQuery(), deliverableFrequenciesModel.executeQuery(), deliverableDefinitionsModel.executeQuery()])
                    .then(function (resolvedPromises) {

                        deliverables = resolvedPromises[0];
                        deliverableFrequencies = resolvedPromises[1];
                        deliverableDefinitions = resolvedPromises[2];
                        return deliverables;
                    });
            }

}]);
