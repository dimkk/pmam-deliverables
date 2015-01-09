(function () {
    'use strict';

    angular
        .module('pmam-deliverables')
        .factory('deliverableFeedbackService', deliverableFeedbackService);

    /**
     * @ngdoc service
     * @name deliverableFeedbackService
     * @description
     *
     */
    function deliverableFeedbackService(_, $q, deliverableFeedbackModel) {
        var service = {
            getDeliverableFeedback: getDeliverableFeedback,
            addFeedback: addFeedback,
            updateFeedback: updateFeedback,
            deleteFeedback: deleteFeedback
        };

        return service;

        /**==================PRIVATE==================*/

        function getDeliverableFeedback() {

            var deferred = $q.defer();

            deliverableFeedbackModel.executeQuery()
                .then(function (deliverableFeedback) {

                    deferred.resolve(deliverableFeedback);
                });

            return deferred.promise;
        }

        function getDeliverableFeedbackByType(fy, typeId) {

            var deferred = $q.defer();

            deliverablesModel.getFyDeliverables(fy)
                .then(function (indexedCache) {
                    var deliverablesByType = _.where(indexedCache, function (deliverable) {
                        return deliverable.deliverableType.lookupId === typeId;
                    });
                    deferred.resolve(deliverablesByType);
                });
            return deferred.promise;
        }

        function addFeedback() {

        }

        function updateFeedback(item) {

        }

        function deleteFeedback(id) {

        }

    }
})();
