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
            getMonthOptions: getMonthOptions,
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
         * @name calendarService.getCalendarMonth
         * @description Month is the FY Month (1-12), method converts into calendar month (0-11)
         * @param {number} fiscalMonth Fiscal month (1-12)
         * @returns {number} Calendar month number (0-11)
         */
        function getCalendarMonth(fiscalMonth) {
            var calendarMonthNumber = fiscalMonth - 4;
            if(calendarMonthNumber < 0) {
                calendarMonthNumber = calendarMonthNumber + 12;
            }
            return calendarMonthNumber
        }

        function getMonthOptions() {
            return [
                {number: 4, label: 'January'},
                {number: 5, label: 'February'},
                {number: 6, label: 'March'},
                {number: 7, label: 'April'},
                {number: 8, label: 'May'},
                {number: 9, label: 'June'},
                {number: 10, label: 'July'},
                {number: 11, label: 'August'},
                {number: 12, label: 'September'},
                {number: 1, label: 'October'},
                {number: 2, label: 'November'},
                {number: 3, label: 'December'}
            ]
        }




    }
})();
