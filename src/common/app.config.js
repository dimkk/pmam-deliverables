/// <reference path="../../typings/tsd.d.ts" />
(function () {
    'use strict';
    angular.module('pmam-deliverables').config(config);
    function config(apConfig, toastrConfig, uiSelectConfig) {
        /** Set the default toast location */
        toastrConfig.positionClass = 'toast-bottom-right';
        uiSelectConfig.theme = 'bootstrap';
        apConfig.firebaseURL = apConfig.offline ? 'https://pmam-deliverables.firebaseIO.com/offline/' : 'https://pmam-deliverables.firebaseIO.com/';
        apConfig.serverUrl = 'https://mcscviper.usmc.mil/';
        apConfig.defaultUrl = apConfig.serverUrl + 'sites/pmammo/internal_to_PM/metrics';
    }
})();
//# sourceMappingURL=app.config.js.map