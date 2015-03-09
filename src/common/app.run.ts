/// <reference path="../../typings/tsd.d.ts" />
(():void => {
    'use strict';

    /**
     * @ngdoc overview
     * @module
     * @name RTM
     * @description
     * A tool developed to assist with the RTM efforts.
     */
    angular.module('pmam-deliverables')
        .run(function (userSettingsModel, userService) {

            userSettingsModel.identifyCurrentUser();
            userService.getUserRoles();
        });

})();
