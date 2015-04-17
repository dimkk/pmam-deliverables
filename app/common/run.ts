/// <reference path="../../typings/app.d.ts" />
module app {
    'use strict';

    angular.module('pmam-deliverables')
        .run(Run);

    function Run(userSettingsModel:UserSettingsModel, userService:UserService) {
        userSettingsModel.identifyCurrentUser();
        userService.getUserRoles();
    }

}
