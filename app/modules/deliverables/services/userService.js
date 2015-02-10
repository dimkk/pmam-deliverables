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

        /**
         * @name userService.getUsers
         * @description Makes an initial call for members of the "ESED Deliverables Participants" group,
         * caches promise, and returns promise for all subsequent requests.
         * @returns {promise} Resolves with an array of users.
         */
        function getUsers() {
            if(!requestForUsers) {
                requestForUsers = apDataService.getCollection({
                    operation:'GetUserCollectionFromGroup',
                    groupName:'ESED Deliverables Participants',
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
                deferred.resolve(userLookupValues);
            });

            return deferred.promise;
        }
    }
})();
