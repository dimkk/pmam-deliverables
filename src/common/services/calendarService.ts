module app.services {
    'use strict';

    export interface ICalendarService {
        getCalendarMonth(fiscalMonth: number): number;
        getCalendarYear(fiscalYear, monthNumber): number;
        getCurrentFiscalMonth(): number;
        getCurrentFiscalYear(): number;
        getMonthOptions(): ICalendarMonth[];
        generateDisplayPeriod(fiscalMonth: number, fiscalYear: number): string;
    }

    export interface ICalendarMonth {
        number: number;
        label: string;
    }

    class calendarService implements ICalendarService {

        /**
         * @name calendarService.getCalendarMonth
         * @description Month is the FY Month (1-12), method converts into calendar month (0-11)
         * @param {number} fiscalMonth Fiscal month (1-12)
         * @returns {number} Calendar month number (0-11)
         */
        getCalendarMonth(fiscalMonth: number): number {
            var calendarMonthNumber = fiscalMonth - 4;
            if (calendarMonthNumber < 0) {
                calendarMonthNumber = calendarMonthNumber + 12;
            }
            return calendarMonthNumber
        }

        /**
         * @name calendarService.getCalendarYear
         * @description Returns a valid calendar year that corresponds with a fiscal year and zero based month number
         * @param {number} fiscalYear
         * @param {number} monthNumber
         * @returns {number} Calendar Year
         */
        getCalendarYear(fiscalYear, monthNumber): number {
            return monthNumber < 9 ? fiscalYear : fiscalYear - 1;
        }

        getCurrentFiscalMonth(): number {
            var calendarMonthNumber = new Date().getMonth() + 4;
            if (calendarMonthNumber > 12) {
                calendarMonthNumber = calendarMonthNumber - 12;
            }
            return calendarMonthNumber
        }

        getCurrentFiscalYear(): number {
            var today = new Date();
            return today.getMonth() < 3 ? today.getFullYear() : today.getFullYear() - 1;
        }

        getMonthOptions(): ICalendarMonth[] {
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

        generateDisplayPeriod(fiscalMonth: number, fiscalYear: number): string {
            var monthNames = ["OCT", "NOV", "DEC", "JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP"],
                calendarYear = fiscalMonth < 4 ? fiscalYear - 1 : fiscalYear,
                twoDigitYear = (calendarYear.toString()).substr(2);
            //Month is (1-12) so we need to add 1 to find value in 0 based monthName array
            return monthNames[fiscalMonth - 1] + " " + twoDigitYear
        }

    }

    angular
        .module('pmam-deliverables')
        .service('calendarService', calendarService);
}
