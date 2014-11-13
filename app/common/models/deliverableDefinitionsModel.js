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
                        objectType: "Number",
                        mappedName: "dateIdentifier",
                        readOnly: false
                    },
                    {staticName: "HardDate", objectType: "Date", mappedName: "hardDate", readOnly: false},
                    {staticName: "FY", objectType: "text", mappedName: "fy", readOnly: false},
                    {
                        staticName: "Frequency_x003a_Acronym",
                        objectType: "Lookup",
                        mappedName: "frequencyAcronym",
                        readOnly: false
                    },
                    {
                        staticName: "FrequencyDescription",
                        objectType: "Text",
                        mappedName: "frequencyDescription",
                        readOnly: false
                    },
                    {staticName: "To", objectType: "User", mappedName: "to", readOnly: false},
                    {staticName: "CC", objectType: "User", mappedName: "cc", readOnly: false}

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
        }

        DeliverableDefinition.prototype.openModal = openModal;


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
        
        model.getFYDefinitions = function(fy) {
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
        };

        /********************* Model Specific Shared Functions ***************************************/


        return model;
    }
})();
