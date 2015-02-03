(function () {
    'use strict';

    /**
     * @ngdoc service
     * @name deliverableDefinitionsModel
     * @model
     * @description
     *
     *
     * @requires apModelFactory
     * @requires apModalService
     */
    angular
        .module('pmam-deliverables')
        .service('deliverableDefinitionsModel', deliverableDefinitionsModel);

    function deliverableDefinitionsModel(_, apModelFactory, apModalService) {

        /********************* Model Definition ***************************************/

        /**
         * @ngdoc object
         * @name deliverableDefinitionsModel.model
         * @description
         *  Model Constructor
         */
        var model = apModelFactory.create({
            factory: DeliverableDefinition,
            /**
             * @ngdoc object
             * @name deliverableDefinitionsModel.list
             * @description
             *  Contains
             *
             *  - list.title (Maps to the offline XML file in dev folder (no spaces))
             *  - list.guid (GUID can be found in list properties in SharePoint designer)
             *  - list.customFields
             *  @requires apListFactory
             */
            list: {
                title: 'DeliverableDefinitions',
                /**Maps to the offline XML file in dev folder (no spaces) */
                guid: '{BD9EF99E-8058-4C33-AC11-EFBE04388451}',
                /**List GUID can be found in list properties in SharePoint designer */
                customFields: [
                /** Array of objects mapping each SharePoint field to a property on a list item object */
                /** If OneApp live templates have been imported type 'oafield' followed by the tab key for
                 /*  each field to quickly map with available options */
                    {staticName: "Title", objectType: "Text", mappedName: "title", readOnly: false},
                    {
                        staticName: "DeliverableNumber",
                        objectType: "Text",
                        mappedName: "deliverableNumber",
                        readOnly: false
                    },
                    {staticName: "Frequency", objectType: "Lookup", mappedName: "frequency", readOnly: false},
                    {
                        staticName: "DateIdentifier",
                        objectType: "Text",
                        mappedName: "dateIdentifier",
                        readOnly: false
                    },
                    {staticName: "HardDate", objectType: "Date", mappedName: "hardDate", readOnly: false},
                    {staticName: "FY", objectType: "text", mappedName: "fy", readOnly: false},
                    //{
                    //    staticName: "Frequency_x003a_Acronym",
                    //    objectType: "Lookup",
                    //    mappedName: "frequencyAcronym",
                    //    readOnly: false
                    //},
                    //{
                    //    staticName: "FrequencyDescription",
                    //    objectType: "Text",
                    //    mappedName: "frequencyDescription",
                    //    readOnly: false
                    //},
                    /** Default To and CC email recipients.  Accepts both users and groups */
                    {staticName: 'To', objectType: 'UserMulti', mappedName: 'to', readOnly: false},
                    {staticName: "CC", objectType: "UserMulti", mappedName: "cc", readOnly: false},
                    //Work unit assignment number (eg 2.1 or 2.3)
                    {staticName: 'TaskNumber', objectType: 'Text', mappedName: 'taskNumber', readOnly: false},
                    /** JSON array of date strings ["2014-12-15", "2015-03-15", "2015-06-15", "2015-09-15"] that will override calculated dates. */
                    {staticName: 'SpecifiedDates', objectType: 'JSON', mappedName: 'specifiedDates', readOnly: false}
                ]
            }
        });

        /*********************************** Factory and Methods ***************************************/
        /**
         * @ngdoc function
         * @name deliverableDefinitionsModel.DeliverableDefinition
         * @description
         * Entity Constructor
         * @param {object} obj New entity to extend.
         * @constructor
         */
        function DeliverableDefinition(obj) {
            var self = this;
            _.extend(self, obj);
            /** Identify all due dates for this deliverable definition and store for later use */
            self.dueDates = calculateDeliverableDueDates(self);
        }

        DeliverableDefinition.prototype.openModal = openModal;
        DeliverableDefinition.prototype.getDeliverableDueDatesForMonth = getDeliverableDueDatesForMonth;


        /** Optionally add a modal form **/
        model.openModal = apModalService.modalModelProvider({
            templateUrl: '',
            controller: '',
            expectedArguments: ['entity']
        });

        function openModal() {
            var listItem = this;
            return model.openModal(listItem);
        }


        /*********************************** Queries ***************************************/

        /** Fetch data (pulls local xml if offline named model.list.title + '.xml')
         *  Initially pulls all requested data.  Each subsequent call just pulls records that have been changed,
         *  updates the model, and returns a reference to the updated data array
         * @returns {Array} Requested list items
         */
        model.registerQuery({
            name: 'primary',
            operation: 'GetListItems',
            query: '' +
            '<Query>' +
            '   <OrderBy>' +
            '       <FieldRef Name="ID" Ascending="TRUE"/>' +
            '   </OrderBy>' +
            '</Query>'
        });

        model.getFyDefinitions = getFyDefinitions;

        return model;


        /********************* Model Specific Shared Functions ***************************************/

        function getFyDefinitions (fy) {
            /** Unique query name (ex: fy2013) */
            var fyCacheKey = 'fy' + fy;

            /** Register fy query if it doesn't exist */
            if (!_.isObject(model.queries[fyCacheKey])) {
                model.registerQuery({
                    name: fyCacheKey,
                    operation: 'GetListItems',
                    query: '' +
                    '<Query>' +
                    '   <OrderBy>' +
                    '       <FieldRef Name="ID" Ascending="TRUE"/>' +
                    '   </OrderBy>' +
                    '   <Where>' +
                    /** Return all records for this FY */
                    '       <Eq>' +
                    '           <FieldRef Name="FY"/>' +
                    '           <Value>' + fy + '</Value>' +
                    '       </Eq>' +
                    '   </Where>' +
                    '</Query>'
                });
            }

            return model.executeQuery(fyCacheKey);
        }

        /**
         * @description Given a zero based month number, returns an array of due dates for the given month or an empty
         * array if there are no due dates for the month.
         * @param {number} zeroBasedMonthNumber
         * @returns {Date[]}
         */
        function getDeliverableDueDatesForMonth(zeroBasedMonthNumber) {
            var deliverableDefinition = this,
                deliverableDueDatesForMonth = [];
            _.each(deliverableDefinition.dueDates, function(dueDate) {
                if(dueDate.getMonth() == zeroBasedMonthNumber) {
                    deliverableDueDatesForMonth.push(dueDate);
                }
            });
            return deliverableDueDatesForMonth;
        }

        /**
         * @name calculateDeliverableDueDates
         * @param {DeliverableDefinition} deliverableDefinition
         * @returns {Array} of date objects.
         */
        function calculateDeliverableDueDates(deliverableDefinition) {
            var dueDates = [],
                i = 0;

            if(deliverableDefinition.specifiedDates.length > 0) {
                /** Dates were manually entered so no need to compute */
                _.each(deliverableDefinition.specifiedDates, function(dateString) {
                    dueDates.push(new Date(dateString));
                });
            } else {

                /** Function that accepts a function and calls it for each of the 12 months */
                var processMonths = function(evalMonth) {
                    for(i = 0; i < 12; i++) {
                        var fy = getFY(parseInt(deliverableDefinition.fy), i);
                        var dueDate = evalMonth(fy, i);
                        if(dueDate) {
                            dueDates.push(dueDate);
                        }
                    }
                };

                /** Compute dates based on periodicity */
                switch( deliverableDefinition.frequency.lookupId ) {
                    case 1:   // monthly
                        /** Check for the case where the date identifier is a string instead of a number formatted as string **/
                        if(isNaN(deliverableDefinition.dateIdentifier)) { //TODO Find a better way to handle the Last day of month case
                            if(deliverableDefinition.dateIdentifier === 'Last') {
                                /** Build an array of dates for the last day of each month */
                                processMonths(function(fy, i) {
                                    /** Using zero for day sets date to last day of previous month, that is why we need i+1 */
                                    return new Date(getFY(deliverableDefinition.fy, i), i + 1, 0);
                                });
                            }
                        } else {
                            processMonths(function(fy, i) {
                                /** Date identifier is numeric value as string which represents the day of month deliverable is due */
                                return new Date(getFY(deliverableDefinition.fy, i), i + 1, parseInt(deliverableDefinition.dateIdentifier));
                            });
                        }
                        break;
                    case 3:  // bi-monthly
                        processMonths(function(fy, i) {
                            /** Only add odd months */
                            if(i % 2) {
                                /** Create a due date for each odd month */
                                return new Date(getFY(deliverableDefinition.fy, i), i + 1, parseInt(deliverableDefinition.dateIdentifier));
                            }
                        });
                        break;
                    case 4:  // one time
                        if( deliverableDefinition.hardDate.length ){
                            dueDates.push(new Date( deliverableDefinition.hardDate ));
                        }
                        break;
                }
            }

            return dueDates;
        }


        /**
         * @description Returns a valid calendar year that corresponds with a fiscal year and zero based month number
         * @param {string} fyString
         * @param {number} monthNumber
         * @returns {Number} Calendar Year
         */
        function getFY(fyString, monthNumber) {
            var fyNumber = parseInt(fyString);
            return monthNumber < 9 ? fyNumber : fyNumber - 1;
        }

    }
})();
