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

        //TODO: implement this method
        function updateFeedback(item) {
            //if(!item.id)

        }

        //TODO: implement this method
        function deleteFeedback(id) {

        }

    }
})();
