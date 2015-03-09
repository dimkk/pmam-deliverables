((): void => {
    'use strict';

    angular.module('pmam-deliverable', [
        //Angular Components
        'ngSanitize',
        'ngAnimate',
        'ngMessages',
        'googlechart',

        //Angular UI
        'ui.router',
        'ui.bootstrap',
        'ui.date',
        'ui.utils',
        'ui.select',
        'ui.sortable',
        'ui.highlight',

//    //Plugins
        'ngTable',
        'firebase',
        'toastr',
        'angular-loading-bar',
        'angular.filter',

        //SP-Angular
        'angularPoint'
    ])

})();
