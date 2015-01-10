(function () {
    'use strict';

    /**
     * @ngdoc service
     * @name deliverableFrequenciesModel
     * @model
     * @description
     *
     *
     * @requires apModelFactory
     * @requires apModalService
     */
    angular
        .module('pmam-deliverables')
        .service('deliverableFrequenciesModel', deliverableFrequenciesModel);

    function deliverableFrequenciesModel(_, apModelFactory, apModalService) {

        /********************* Model Definition ***************************************/

        /**
         * @ngdoc object
         * @name deliverableFrequenciesModel.model
         * @description
         *  Model Constructor
         */
        var model = apModelFactory.create({
            factory: DeliverableFrequency,
            /**
             * @ngdoc object
             * @name deliverableFrequenciesModel.list
             * @description
             *  Contains
             *
             *  - list.title (Maps to the offline XML file in dev folder (no spaces))
             *  - list.guid (GUID can be found in list properties in SharePoint designer)
             *  - list.customFields
             *  @requires apListFactory
             */
            list: {
                title: 'DeliverableFrequencies',
                /**Maps to the offline XML file in dev folder (no spaces) */
                guid: '{FA20C6A2-0B6D-411C-B220-AD8EF1F0C6F8}',
                /**List GUID can be found in list properties in SharePoint designer */
                customFields: [
                /** Array of objects mapping each SharePoint field to a property on a list item object */
                /** If OneApp live templates have been imported type 'oafield' followed by the tab key for
                 /*  each field to quickly map with available options */
                    {staticName: "Title", objectType: "Text", mappedName: "title", readOnly: false},
                    {staticName: "Acronym", objectType: "Text", mappedName: "acronym", readOnly: false}

                ]
            }
        });

        /*********************************** Factory and Methods ***************************************/
        /**
         * @ngdoc function
         * @name deliverableFrequenciesModel.DeliverableFrequency
         * @description
         * Entity Constructor
         * @param {object} obj New entity to extend.
         * @constructor
         */
        function DeliverableFrequency(obj) {
            var self = this;
            _.extend(self, obj);
        }

        DeliverableFrequency.prototype.openModal = openModal;


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
            query: '' +
            '<Query>' +
            '   <OrderBy>' +
            '       <FieldRef Name="ID" Ascending="TRUE"/>' +
            '   </OrderBy>' +
            '</Query>'
        });

        /********************* Model Specific Shared Functions ***************************************/


        return model;
    }
})();
