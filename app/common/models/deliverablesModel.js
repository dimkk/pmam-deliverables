(function () {
    'use strict';

    /**
     * @ngdoc service
     * @name deliverablesModel
     * @model
     * @description
     *
     *
     * @requires apModelFactory
     * @requires apModalService
     */
    angular
        .module('pmam-deliverables')
        .service('deliverablesModel', deliverablesModel);

    function deliverablesModel(_, apModelFactory, apModalService) {

        /********************* Model Definition ***************************************/

        /**
         * @ngdoc object
         * @name deliverablesModel.model
         * @description
         *  Model Constructor
         */
        var model = apModelFactory.create({
            factory: Deliverable,
            /**
             * @ngdoc object
             * @name deliverablesModel.list
             * @description
             *  Contains
             *
             *  - list.title (Maps to the offline XML file in dev folder (no spaces))
             *  - list.guid (GUID can be found in list properties in SharePoint designer)
             *  - list.customFields
             *  @requires apListFactory
             */
            list: {
                title: 'Deliverables',
                /**Maps to the offline XML file in dev folder (no spaces) */
                guid: '{5F7B373D-E9D4-4D52-8B34-64D5144F5451}',
                /**List GUID can be found in list properties in SharePoint designer */
                customFields: [
                /** Array of objects mapping each SharePoint field to a property on a list item object */
                /** If OneApp live templates have been imported type 'oafield' followed by the tab key for
                 /*  each field to quickly map with available options */
                    {staticName: "Title", objectType: "Text", mappedName: "title", readOnly: false},
                    {staticName: "Type", objectType: "Lookup", mappedName: "type", readOnly: false},
                    {staticName: "StartDate", objectType: "Date", mappedName: "startdate", readOnly: false},
                    {staticName: "SubmissionDate", objectType: "Date", mappedName: "submissiondate", readOnly: false},
                    {staticName: "FY", objectType: "text", mappedName: "fy", readOnly: false},
                    {staticName: "Month", objectType: "text", mappedName: "month", readOnly: false},
                    {staticName: "Details", objectType: "Text", mappedName: "details", readOnly: false},
                    {staticName: "Justification", objectType: "Text", mappedName: "justification", readOnly: false},
                    {staticName: "To", objectType: "UserMulti", mappedName: "to", readOnly: false},
                    {staticName: "CC", objectType: "UserMulti", mappedName: "cc", readOnly: false}

                ]
            }
        });

        /*********************************** Factory and Methods ***************************************/
        /**
         * @ngdoc function
         * @name deliverablesModel.Deliverable
         * @description
         * Entity Constructor
         * @param {object} obj New entity to extend.
         * @constructor
         */
        function Deliverable(obj) {
            var self = this;
            _.extend(self, obj);
            self.displayDate = moment(self.submissiondate).format('MMM YY');
            self.formattedstartdate = moment(self.startdate).format('MM/DD/YYYY')
            self.formattedsubmissiondate = moment(self.submissiondate).format('MM/DD/YYYY')

        }

        Deliverable.prototype.openModal = openModal;


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
