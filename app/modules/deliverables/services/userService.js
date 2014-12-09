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
    function userService(apDataService) {
        var service = {getUsers:getUsers};
        var requestForUsers;

        return service;

        /**==================PRIVATE==================*/
// todo: create a group called deliverableActors
// todo: change back to GetUserCollectionFromGroup

        function getUsers() {
            if(!requestForUsers) {
                requestForUsers = apDataService.getCollection({operation:'GetUserCollectionFromSite',groupName:'deliverableActors',filterNode:'User'});
            }
            return requestForUsers;
        }
    }
})();
