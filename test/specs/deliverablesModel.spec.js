'use strict';

describe('Model: deliverablesModel', function () {
    var deliverablesModel, deliverableDefinitionsModel, deliverable, $httpBackend, apCacheService;


    beforeEach(module('pmam-deliverables'));

    beforeEach(inject(function ($injector, $q) {

        // Set up the mock http service responses
        $httpBackend = $injector.get('$httpBackend');
        deliverablesModel = $injector.get('deliverablesModel');
        deliverableDefinitionsModel = $injector.get('deliverableDefinitionsModel');
        apCacheService = $injector.get('apCacheService');

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

    }));

    describe('Method: estimateDeliverableDueDate', function () {
        it('correctly estimates deliverable due date for a monthly deliverable.', function () {

            var deliverableDefinition = deliverableDefinitionsModel.createEmptyItem({
                id: 1,
                deliverableFrequency: 'Monthly',
                dayOfMonthDue: 10,
                fy: 2015
            });

            apCacheService.registerEntity(deliverableDefinition);

            var deliverable = deliverablesModel.createEmptyItem({
                fiscalMonth: 7,
                deliverableType: {lookupId: 1}
            });

            expect(deliverable.estimateDeliverableDueDate()).toEqual(new Date(2015, 3, 10));


            //apCacheService.registerEntity(deliverable);
            //
            //deliverableDefinitionsModel.getFyDefinitions(2015)
            //    .then(function () {
            //        var deliverable = deliverablesModel.createEmptyItem({
            //            fiscalMonth: 7,
            //            startDate: new Date(2015, 3, 1),
            //            submissionDate: new Date(2015, 3, 1),
            //            deliverableType: {lookupId: 34}
            //        });
            //        /** Ensure deliverables are available */
            //        expect(deliverable.estimateDeliverableDueDate()).toEqual(new Date(2015, 3, 17));
            //    });
            ////deliverablesModel.getFyDeliverables(2015)
            ////    .then(function (deliverables) {
            ////        expect(deliverables).toBe("Something");
            ////    });
            ////
            //$httpBackend.flush();

        });
        it('estimates deliverable due date for a bi-monthly deliverable.', function () {

            var deliverableDefinition = deliverableDefinitionsModel.createEmptyItem({
                id: 2,
                deliverableFrequency: 'Bimonthly',
                dayOfMonthDue: 10,
                fy: 2015
            });

            apCacheService.registerEntity(deliverableDefinition);


            var deliverable = deliverablesModel.createEmptyItem({
                fiscalMonth: 8,
                deliverableType: {lookupId: 2}
            });

            expect(deliverable.estimateDeliverableDueDate()).toEqual(new Date(2015, 4, 10));


        });

        it('does not return a due date for a bi-monthly deliverable on an even month.', function () {

            var deliverableDefinition = deliverableDefinitionsModel.createEmptyItem({
                id: 2,
                deliverableFrequency: 'Bimonthly',
                dayOfMonthDue: 10,
                fy: 2015
            });

            apCacheService.registerEntity(deliverableDefinition);


            var deliverable = deliverablesModel.createEmptyItem({
                fiscalMonth: 7,
                deliverableType: {lookupId: 2}
            });

            expect(deliverable.estimateDeliverableDueDate()).toBeUndefined();


        });

        //it('doesn\'t return a date for a month for a due date for a bi-monthly deliverable.', function () {
        //
        //    var deliverableDefinition = deliverableDefinitionsModel.createEmptyItem({
        //        id:2,
        //        deliverableFrequency:'Bimonthly',
        //        dayOfMonthDue:10,
        //        fy:2015
        //    });
        //
        //    apCacheService.registerEntity(deliverableDefinition);
        //
        //    var deliverable = deliverablesModel.createEmptyItem({
        //        fiscalMonth: 8,
        //        deliverableType: {lookupId: 2}
        //    });
        //
        //    expect(deliverable.estimateDeliverableDueDate()).toEqual(new Date(2015, 4, 17));
        //
        //
        //});
    });

    //describe('Method: getDaysBetweenSubmittedAndDue', function () {
    //    it('returns the delta between submitted and due.', function () {
    //        var deliverable = deliverablesModel.createEmptyItem({
    //            fiscalMonth: 7,
    //            startDate: new Date(2015, 3, 1),
    //            submissionDate: new Date(2015, 3, 1),
    //            deliverableType: {lookupId: 34}
    //        });
    //
    //        /** Ensure deliverables are available */
    //        expect(deliverable.estimateDeliverableDueDate()).toEqual(new Date(2015, 3, 17));
    //
    //    });
    //});


});

//beforeEach(module("angularPoint"));
//
//var service,
//    mockEntityCache,
//    mockModel,
//    updatedMock = {
//        "id": 1,
//        "title": "Updated Mock"
//    },
//    newMock = {
//        id: 3,
//        title: "New Mock"
//    },
//    emptyEntityCache,
//    resolvedEntityCache,
//    $rootScope;
//
//beforeEach(inject(function (_apCacheService_, _mockModel_, _$rootScope_) {
//    service = _apCacheService_;
//    $rootScope = _$rootScope_;
//    mockModel = _mockModel_;
//    mockEntityCache = mockModel.getCache();
//}));
//
//describe('getEntityTypeKey', function () {
//    it('returns the key when passed a guid', function () {
//        expect(service.getListId(mockModel.list.guid)).toEqual(mockModel.list.guid.toLowerCase());
//    });
//
//    it('returns the key the name of a model is used', function () {
//        expect(service.getListId(mockModel.list.title)).toEqual(mockModel.list.guid.toLowerCase());
//    });
//});
