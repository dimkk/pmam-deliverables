//TODO See if we can use this predefined object instead of making a call to the database to get definitions, this is not currently being used
(function () {
    'use strict';

    /**
     AR = _ days upon request
     BM = _ day of odd month
     MO = _ day of month
     OT = _ days upon notification (Only applicable if there isn't a hard date)
     * */
    angular
        .module('pmam-deliverables')
        .constant('deliverableFrequencies',[
            {title: 'Monthly', acronym: 'MO'},
            {title: 'As Required', acronym: 'AR'},
            {title: 'Bi-monthly', acronym: 'BM'},
            {title: 'One Time', acronym: 'OT'},
            {title: 'Quarterly', acronym: 'QT'},
            {title: 'Specified Dates', acronym: 'SD'}
        ]);

})();
