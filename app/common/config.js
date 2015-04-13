angular.module('pmam-deliverables')
    .config(function (apConfig, toastrConfig, uiSelectConfig) {
        /** Set the default toast location */
        toastrConfig.positionClass = 'toast-bottom-right';

        uiSelectConfig.theme = 'bootstrap';
        uiSelectConfig.resetSearchInput = true;

        apConfig.firebaseURL = apConfig.offline ?
            'https://pmam-deliverables.firebaseIO.com/offline/' : 'https://pmam-deliverables.firebaseIO.com/';

        apConfig.serverUrl = 'https://mcscviper.usmc.mil/';

        apConfig.defaultUrl = apConfig.serverUrl + 'sites/pmammo/internal_to_PM/metrics';

    });
