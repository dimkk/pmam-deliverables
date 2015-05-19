'use strict';

describe('Model: deliverablesModel', function () {
    var deliverablesModel, deliverableDefinitionsModel, monthlyDefinition, $httpBackend, apCacheService, deliverableAccessMetricsModel, apIndexedCacheFactory;


    beforeEach(module('pmam-deliverables'));

    beforeEach(inject(function ($injector, $q) {

        // Set up the mock http service responses
        $httpBackend = $injector.get('$httpBackend');
        deliverablesModel = $injector.get('deliverablesModel');
        deliverableDefinitionsModel = $injector.get('deliverableDefinitionsModel');
        apCacheService = $injector.get('apCacheService');
        apIndexedCacheFactory = $injector.get('apIndexedCacheFactory');
        deliverableAccessMetricsModel = $injector.get('deliverableAccessMetricsModel');
        monthlyDefinition = deliverableDefinitionsModel.createEmptyItem({
            id: 1,
            deliverableFrequency: 'Monthly',
            dayOfMonthDue: 20,
            fy: 2015
        });
        apCacheService.registerEntity(monthlyDefinition);

    }));


    describe('Method: getDaysBetweenSubmittedAndDue', function () {
        it('returns the delta between submitted and due when due is provided.', function () {

            var deliverable = deliverablesModel.createEmptyItem({
                fiscalMonth: 7,
                dueDate: new Date(2015, 3, 10),
                submissionDate: new Date(2015, 3, 3),
                deliverableType: {lookupId: 1}
            });

            expect(deliverable.getDaysBetweenSubmittedAndDue()).toEqual(7);

        });

        it('returns a negative number of days when submitted exceeds due date.', function () {

            var deliverable = deliverablesModel.createEmptyItem({
                fiscalMonth: 7,
                dueDate: new Date(2015, 3, 10),
                submissionDate: new Date(2015, 3, 15),
                deliverableType: {lookupId: 1}
            });

            expect(deliverable.getDaysBetweenSubmittedAndDue()).toEqual(-5);

        });

        it('returns the delta between submitted and due when due is not provided.', function () {

            var deliverable = deliverablesModel.createEmptyItem({
                fiscalMonth: 7,
                submissionDate: new Date(2015, 3, 10),
                deliverableType: {lookupId: 1}
            });

            expect(deliverable.getDaysBetweenSubmittedAndDue()).toEqual(10);

        });
    });

    describe('Method: getViewCount', function () {
        it('returns the correct count when the deliverable has been viewed.', function () {

            var deliverable = deliverablesModel.createEmptyItem(-1);
            deliverableAccessMetricsModel.createEmptyItem({id: -1, accessEvents: [{}, {}]});

            expect(deliverable.getViewCount()).toEqual(2);
        });
        it('returns a count of 0 when the deliverable has not been viewed.', function () {
            var deliverable = deliverablesModel.createEmptyItem({id: -2});
            //spyOn(deliverable, "getCachedAccessLogsByDeliverableId").and.returnValue(apIndexedCacheFactory.create());
            expect(deliverable.getViewCount()).toEqual(0);
        });

    });

    describe('Method: hasFeedback', function () {
        it('returns proper response if feedback is present.', function () {
            var deliverable = deliverablesModel.createEmptyItem();
            var mockIndexedCache = apIndexedCacheFactory.create();
            mockIndexedCache.addEntity({id:1});
            spyOn(deliverable, "getCachedFeedbackByDeliverableId").and.returnValue(mockIndexedCache);
            expect(deliverable.hasFeedback()).toBeTruthy();
        });

        it('returns proper response if there is no feedback.', function () {
            var deliverable = deliverablesModel.createEmptyItem();
            var mockIndexedCache = apIndexedCacheFactory.create();
            spyOn(deliverable, "getCachedFeedbackByDeliverableId").and.returnValue(mockIndexedCache);
            expect(deliverable.hasFeedback()).toBeFalsy();
        });
    });

    describe('Method: wasDeliveredOnTime', function () {
        it('returns true if delivered prior to due date.', function () {
            var deliverable = deliverablesModel.createEmptyItem({
                fiscalMonth: 7,
                dueDate: new Date(2015, 3, 10),
                submissionDate: new Date(2015, 3, 3),
                deliverableType: {lookupId: 1}
            });
            expect(deliverable.wasDeliveredOnTime()).toBeTruthy();
        });

        it('returns true if delivered on the due date.', function () {
            var deliverable = deliverablesModel.createEmptyItem({
                fiscalMonth: 7,
                dueDate: new Date(2015, 3, 10),
                submissionDate: new Date(2015, 3, 10),
                deliverableType: {lookupId: 1}
            });
            expect(deliverable.wasDeliveredOnTime()).toBeTruthy();
        });

        it('returns false if delivered after due date.', function () {
            var deliverable = deliverablesModel.createEmptyItem({
                fiscalMonth: 7,
                dueDate: new Date(2015, 3, 10),
                submissionDate: new Date(2015, 3, 11),
                deliverableType: {lookupId: 1}
            });
            expect(deliverable.wasDeliveredOnTime()).toBeFalsy();
        });
    });



});

//deliverable = deliverablesModel.createEmptyItem({
//    "id": 110,
//    "modified": "2015-04-17T21:21:54.000Z",
//    "created": "2015-04-17T21:20:23.000Z",
//    "author": "",
//    "editor": "",
//    "permMask": "0x7fffffffffffffff",
//    "uniqueId": "110;#{D10B47E5-E1F0-436F-B34E-9403B7C67737}",
//    "fileRef": {
//        "lookupId": 110,
//        "lookupValue": "sites/pmammo/internal_to_PM/metrics/Lists/Deliverables/110_.000"
//    },
//    "title": "Under 24 Month SLP Report (formerly CC C Countdown) - April 2015",
//    "deliverableType": {"lookupId": 34, "lookupValue": "WUA15-009/2.1.4.a.3"},
//    "startDate": "2015-04-17T18:19:42.000Z",
//    "submissionDate": "2015-04-12T18:19:42.000Z",
//    "dueDate": "2015-04-17T07:00:00.000Z",
//    "fy": 2015,
//    "fiscalMonth": 7,
//    "details": "Attached is the current listing of assets whose SLP age are within 13 months to 24 ...",
//    "justification": "",
//    "to": [],
//    "cc": [],
//    "discussionThread": {"posts": [], "nextId": 0},
//    "stakeholderNotificationDate": null,
//    "attachments": ["...Lists/Deliverables/Attachments/110/Under 24 Month SLP Report (formerly CC C Future
// (less SESEMS) - April 2015.xlsx"] });
