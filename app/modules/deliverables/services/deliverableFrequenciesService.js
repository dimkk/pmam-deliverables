(function () {
    'use strict';

    angular
        .module('pmam-deliverables')
        .factory('deliverableFrequenciesService', deliverableFrequenciesService);

    /**
     * @ngdoc service
     * @name deliverableFrequenciesService
     * @description
     *
     */
    function deliverableFrequenciesService() {
        var service = {
            getFrequencies: getFrequencies()
        };

        return service;

        /**==================PRIVATE==================*/

        function getFrequencies() {
            return [
                {title: 'As Required', abbreviation: 'AR'},
                {title: 'Bimonthly', abbreviation: 'BM'},
                {title: 'Monthly', abbreviation: 'MO'},
                {title: 'One Time', abbreviation: 'OT'},
                {title: 'Quarterly', abbreviation: 'QT'},
                {title: 'Specified Dates', abbreviation: 'SD'}
            ]
        }
    }
})();
