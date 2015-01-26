(function () {
    'use strict';

    angular
        .module('pmam-deliverables')
        .factory('userService', userService);

    /**
     * @ngdoc service
     * @name userService
     * @description
     *
     */
    function userService($q, apDataService) {
        var service = {
            getUserLookupValues: getUserLookupValues,
            getUsers:getUsers
        };
        var requestForUsers;

        return service;

        /**==================PRIVATE==================*/

        function getUsers() {
            if(!requestForUsers) {
                requestForUsers = apDataService.getCollection({
                    operation:'GetUserCollectionFromSite',
                    groupName:'deliverableActors',
                    filterNode:'User'
                });
            }
            return requestForUsers;
        }

        /**
         * @ngdoc function
         * @name userService.getUserLookupValues
         * @methodOf userService
         * @description
         * Creates an array of {lookupValue: UserName, lookupId: UserID} representations of users so we
         * can use directly in user lookup controls.
         * @returns {promise} Deferred object that resolves with an array of user lookup objects.
         */
        function getUserLookupValues() {
            var deferred = $q.defer();
            getUsers().then(function (userArray) {
                var userLookupValues = _.map(userArray, function (user) {
                    return {lookupValue: user.Name, lookupId: user.ID};
                });
                deferred.resolve(userLookupValues)
            });

            return deferred.promise;
        }
    }
})();
