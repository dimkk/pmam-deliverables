/// <reference path="../../../typings/app.d.ts" />
module app {
    'use strict';

    var service:UserService;

    interface IUserRoles{
        [key:string]: boolean
    }

    /**
     * @ngdoc service
     * @name userService
     * @description
     */
    export class UserService {
        requestForUsers;
        requestForUserRoles;
        /** Defines the primary user roles within the application and is updated based on group memberships of the current
         * user after application bootstrap */
        userRoles:IUserRoles = {
            /** Members of this group have admin rights over the process and control all aspects */
            'ESED Administrators': false,
            /** Members of this group are part of the ESED team responsible for uploading deliverables. */
            'ESED Deliverables Contributors': false,
            /** Members of this group are part of the PM-Ammo team and are responsible for providing deliverable feedback and reviews. */
            'ESED Deliverables Reviewers': false,
            /** Base group that you need to be a part of in order to participate in the application */
            'ESED Deliverables Participants': true
        };

        constructor(private $q, private apUserModel, private apDataService) {
            service = this;
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
        getUserLookupValues():ap.IUser[] {
            var deferred = service.$q.defer();
            service.getUsers().then(function (userArray) {
                var userLookupValues = _.map(userArray, function (user) {
                    return {lookupValue: user.Name, lookupId: parseInt(user.ID)};
                });
                deferred.resolve(userLookupValues);
            });

            return deferred.promise;
        }

        getUserRoles():ng.IPromise<IUserRoles> {
            /** Only run once and return cached deferred object for subsequent calls */
            if (!service.requestForUserRoles) {
                var requestQueue = [];
                /** Extend the user roles constant with boolean values pertaining to if the current user is a member of the group */
                _.each(service.userRoles, function (memberOf, groupName) {
                    requestQueue.push(service.apUserModel.checkIfMember(groupName)
                        .then(function (userMembership) {
                            service.userRoles[groupName] = userMembership;
                        }));
                });

                service.requestForUserRoles = service.$q.all(requestQueue);
            }

            return service.requestForUserRoles;
        }

        /**
         * @name userService.getUsers
         * @description Makes an initial call for members of the "ESED Deliverables Participants" group,
         * caches promise, and returns promise for all subsequent requests.
         * @returns {promise} Resolves with an array of users.
         */
        getUsers():ng.IPromise<ap.IUser[]> {
            if (!service.requestForUsers) {
                service.requestForUsers = service.apDataService.getCollection({
                    operation: 'GetUserCollectionFromGroup',
                    groupName: 'ESED Deliverables Participants',
                    filterNode: 'User'
                });
            }
            return service.requestForUsers;
        }

        userCanContribute():boolean {
            return service.userRoles['ESED Deliverables Contributors'] || service.userIsAdmin();
        }

        userCanReview():boolean {
            return service.userRoles['ESED Deliverables Reviewers'] || service.userIsAdmin();
        }

        userIsAdmin():boolean {
            return service.userRoles['ESED Administrators'];
        }

    }

    angular
        .module('pmam-deliverables')
        .service('userService', UserService);

}
