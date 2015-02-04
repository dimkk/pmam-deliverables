(function () {
    'use strict';

    angular
        .module('pmam-deliverables')
        .factory('calendarService', calendarService);

    /**
     * @ngdoc service
     * @name calendarService
     * @description
     *
     */
    function calendarService() {
        var service = {
            getCalendarMonth: getCalendarMonth,
            getCurrentFiscalMonth: getCurrentFiscalMonth,
            getCurrentFiscalYear: getCurrentFiscalYear,
            generateDisplayPeriod: generateDisplayPeriod
        };

        return service;

        /**==================PRIVATE==================*/
        function getCurrentFiscalYear() {
            var today = new Date();
            return today.getMonth() < 3 ? today.getFullYear() : today.getFullYear() - 1;

        }
        function getCurrentFiscalMonth() {
            var calendarMonthNumber = new Date().getMonth() + 4;
            if(calendarMonthNumber > 12) {
                calendarMonthNumber = calendarMonthNumber - 12;
            }
            return calendarMonthNumber
        }

        function generateDisplayPeriod(fiscalMonth, fiscalYear) {
            var monthNames = ["OCT","NOV","DEC","JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP"],
                calendarYear = fiscalMonth < 4 ? fiscalYear - 1 : fiscalYear,
                twoDigitYear = (calendarYear.toString()).substr(2);
            //Month is (1-12) so we need to add 1 to find value in 0 based monthName array
            return monthNames[fiscalMonth - 1] + " " + twoDigitYear
        }

        /**
         * @description Month is the FY Month (1-12), method converts into calendar month (0-11)
         */
        function getCalendarMonth(fiscalMonth) {
            var deliverable = this,
                calendarMonthNumber = fiscalMonth - 3;
            if(calendarMonthNumber <= 0) {
                calendarMonthNumber = calendarMonthNumber + 12;
            }
            return calendarMonthNumber
        }


    }
})();
