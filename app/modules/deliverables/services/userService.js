(function () {
    'use strict';

    angular
        .module('pmam-deliverables')
        .factory('userService', userService);

    /**
     * @ngdoc service
     * @name userService
     * @description
     */
    function userService($q, _, apUserModel, apDataService) {
        var service = {
            userCanReview: userCanReview,
            userCanContribute: userCanContribute,
            userIsAdmin: userIsAdmin,
            getUserLookupValues: getUserLookupValues,
            getUserRoles: getUserRoles,
            getUsers:getUsers
        };
        var requestForUsers, requestForUserRoles;

        /** Defines the primary user roles within the application and is updated based on group memberships of the current
         * user after application bootstrap */
        var userRoles = {
            /** Members of this group have admin rights over the process and control all aspects */
            'ESED Administrators': false,
            /** Members of this group are part of the ESED team responsible for uploading deliverables. */
            'ESED Deliverables Contributors': false,
            /** Members of this group are part of the PM-Ammo team and are responsible for providing deliverable feedback and reviews. */
            'ESED Deliverables Reviewers': false,
            /** Base group that you need to be a part of in order to participate in the application */
            'ESED Deliverables Participants': true
        };


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
                    return {lookupValue: user.Name, lookupId: parseInt(user.ID)};
                });
                deferred.resolve(userLookupValues);
            });

            return deferred.promise;
        }

        function getUserRoles() {
            /** Only run once and return cached deferred object for subsequent calls */
            if(!requestForUserRoles) {
                var requestQueue = [];
                /** Extend the user roles constant with boolean values pertaining to if the current user is a member of the group */
                _.each(userRoles, function(memberOf, groupName) {
                    requestQueue.push(apUserModel.checkIfMember(groupName)
                        .then(function (userMembership) {
                            userRoles[groupName] = userMembership;
                        }));
                });

                requestForUserRoles = $q.all(requestQueue);
            }

            return requestForUserRoles;
        }

        function userCanReview() {
            return userRoles['ESED Deliverables Reviewers'] || userIsAdmin();
        }

        function userCanContribute() {
            return userRoles['ESED Deliverables Contributors'] || userIsAdmin();
        }

        function userIsAdmin() {
            return userRoles['ESED Administrators'];
        }
    }
})();
