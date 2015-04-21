'use strict';

describe('Service: calendarService', function () {
    var calendarService;


    beforeEach(module('pmam-deliverables'));

    beforeEach(inject(function ($injector) {

        // Set up the mock http service responses
        calendarService = $injector.get('calendarService');


    }));

    describe('Method: generateDisplayPeriod', function () {
        it('correctly creates a display period.', function () {
            expect(calendarService.generateDisplayPeriod(1,2015)).toEqual('OCT 14');

            expect(calendarService.generateDisplayPeriod(4,2015)).toEqual('JAN 15');

            expect(calendarService.generateDisplayPeriod(12,2015)).toEqual('SEP 15');
        });
    });

    describe('Method: getCalendarMonth', function () {
        it('correctly converts a fiscal month into a calendar month.', function () {
            expect(calendarService.getCalendarMonth(1)).toEqual(9);

            expect(calendarService.getCalendarMonth(4)).toEqual(0);

            expect(calendarService.getCalendarMonth(12)).toEqual(8);
        });
    });

    describe('Method: getCalendarYear', function () {
        it('returns a valid calendar year that corresponds with a fiscal year and zero based month number.', function () {
            expect(calendarService.getCalendarYear(2015, 0)).toEqual(2015);

            expect(calendarService.getCalendarYear(2015, 8)).toEqual(2015);

            expect(calendarService.getCalendarYear(2015, 9)).toEqual(2014);

            expect(calendarService.getCalendarYear(2015, 12)).toEqual(2014);
        });
    });

    describe('Method: getCurrentFiscalMonth', function () {
        it('calculates the fiscal month for a given date.', function () {
            expect(calendarService.getCurrentFiscalMonth(new Date(2014, 9, 1))).toEqual(1);

            expect(calendarService.getCurrentFiscalMonth(new Date(2014, 11, 1))).toEqual(3);

            expect(calendarService.getCurrentFiscalMonth(new Date(2015, 0, 20))).toEqual(4);

            expect(calendarService.getCurrentFiscalMonth(new Date(2015, 8, 5))).toEqual(12);
        });
    });

    describe('Method: getCurrentFiscalYear', function () {
        it('calculates the fiscal year for a given date.', function () {
            expect(calendarService.getCurrentFiscalYear(new Date(2014, 8, 1))).toEqual(2014);

            expect(calendarService.getCurrentFiscalYear(new Date(2014, 9, 11))).toEqual(2015);

            expect(calendarService.getCurrentFiscalYear(new Date(2015, 0, 20))).toEqual(2015);

            expect(calendarService.getCurrentFiscalYear(new Date(2015, 9, 5))).toEqual(2016);
        });
    });


});
