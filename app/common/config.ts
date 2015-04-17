/// <reference path="../../typings/app.d.ts" />
module app {
    'use strict';

    interface IAPConfig extends ap.IAPConfig{
        serverUrl:string;
    }


    angular.module('pmam-deliverables')
        .config(Config);

    function Config(apConfig:IAPConfig, toastrConfig, uiSelectConfig) {
        /** Set the default toast location */
        toastrConfig.positionClass = 'toast-bottom-right';

        uiSelectConfig.theme = 'bootstrap';
        uiSelectConfig.resetSearchInput = true;

        apConfig.firebaseURL = apConfig.offline ?
            'https://pmam-deliverables.firebaseIO.com/offline/' : 'https://pmam-deliverables.firebaseIO.com/';

        apConfig.serverUrl = 'https://mcscviper.usmc.mil/';

        apConfig.defaultUrl = apConfig.serverUrl + 'sites/pmammo/internal_to_PM/metrics';

    }
}
