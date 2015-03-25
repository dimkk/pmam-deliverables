(function () {
    'use strict';

    angular
        .module('pmam-deliverables')
        .factory('uiGridService', uiGridService);

    /**
     * @ngdoc service
     * @name uiGridService
     * @description
     *
     */
    function uiGridService(_) {
        var iconWidth = 100;
        var service = {
            getDeliverableFields: getDeliverableFields
        };

        return service;

        /**==================PRIVATE==================*/

        function getDeliverableFields() {
            var deliverableFields = [
                {
                    displayName: 'Title',
                    field: 'title',
                    width: '30%',
                    cellTemplate: '<div class="ui-grid-cell-contents">\n    <a ui-sref="deliverable({id:row.entity.id})" title="View this deliverable">{{ row.entity.title }}</a>\n</div>'
                },
                {
                    displayName: 'Type',
                    width: '15%',
                    field: 'deliverableType.lookupValue',
                    cellTemplate: '<div class="ui-grid-cell-contents">\n    <a ui-sref="deliverables.instances({fy:row.entity.fy, id:row.entity.deliverableType.lookupId})"\n       title="View all deliverables of this type">{{ row.entity.deliverableType.lookupValue }}</a>\n</div>'
                },
                {
                    displayName: 'Submission Date',
                    sort: {direction: 'asc'},
                    field: 'submissionDate',
                    cellTemplate: dateField()
                },
                {
                    displayName: 'Due Date',
                    field: 'dueDate',
                    cellTemplate: dateField()
                },
                {
                    displayName: 'Frequency',
                    field: 'getDeliverableDefinition().deliverableFrequency'
                },
                {
                    displayName: 'On Time',
                    field: 'wasDeliveredOnTime()',
                    width: iconWidth,
                    cellTemplate: '<div class="ui-grid-cell-contents">\n    <on-time-check-mark data-deliverable="row.entity"></on-time-check-mark>\n</div>'
                },
                {
                    displayName: 'Acceptable',
                    field: 'acceptable',
                    width: iconWidth,
                    cellTemplate: '<div class="ui-grid-cell-contents">\n    <rating-stoplight data-deliverable="row.entity"></rating-stoplight>\n</div>'
                },
                discussionThread(),
                {
                    displayName: 'Views',
                    field: 'getViewCount()',
                    width: iconWidth,
                    cellTemplate: '<div class="ui-grid-cell-contents">\n<span class="badge">{{row.entity.getViewCount()}}</span></div>'
                },
                {
                    displayName: 'Start Date',
                    field: 'startDate',
                    cellTemplate: dateField(),
                    visible: false
                },
                {
                    displayName: 'FY',
                    field: 'fy',
                    visible: false
                },
                {
                    displayName: 'Details',
                    field: 'details',
                    visible: false
                },
                {
                    displayName: 'To',
                    field: 'getFormattedValue("to")',
                    visible: false
                },
                {
                    displayName: 'CC',
                    field: 'getFormattedValue("cc")',
                    visible: false
                },
                {
                    displayName: 'Attachments',
                    field: 'attachments.length',
                    visible: false
                },
                {
                    displayName: 'Feedback Count',
                    field: 'getCachedFeedbackByDeliverableId().length',
                    visible: false
                }

            ];

            _.each(deliverableFields, function(fieldDefinition) {
                fieldDefinition.enableFiltering = false;
            });

            return deliverableFields;

        }

        function createColumnDef(model, fieldName, options) {
            var columnDef = {
                name: fieldName,
                field: 'getFormattedValue("' + fieldName + '")'
            };

            var fieldDefinition = model.getFieldDefinition(fieldName);

            if (fieldDefinition.Choices) {
                var filter = {
                    type: 'select',
                    selectOptions: []
                };

                _.each(fieldDefinition.Choices, function (choiceString) {
                    filter.selectOptions.push({label: choiceString, value: choiceString});
                });
                columnDef.filters = [filter];
            }

            return _.extend({}, columnDef, options);

        }

        function containsString(searchTerm, cellValue) {
            return cellValue.match(searchTerm);
        }

        function generateOpenModalLink() {
            return '' +
                '<div class="ui-grid-cell-contents">' +
                '       <a style="color: #428bca" href ng-click="row.entity.openModal()">' +
                '           {{ grid.getCellValue(row, col) }}' +
                '       </a>' +
                '</div>'

        }

        function dateField() {
            return '<div class="ui-grid-cell-contents">{{ grid.getCellValue(row, col) | date:\'shortDate\' }}</div>';
        }

        function discussionThread() {
            return {
                displayName: 'Discussion',
                field: 'discussionThread.posts.length',
                cellTemplate: '<div class="ui-grid-cell-contents">\n    <i ng-if="row.entity.discussionThread.posts && row.entity.discussionThread.posts.length > 0"\n       title="Contains an active discussion thread."\n       class="fa fa-comments"></i>\n</div>',
                filter: {
                    type: 'select',
                    selectOptions: [{value: 'true', label: 'True'}, {value: 'false', label: 'False'}],
                    width: iconWidth,
                    condition: function (searchTerm, cellValue) {
                        if (searchTerm === 'true') {
                            return cellValue.posts.length > 0;
                        } else {
                            return cellValue.posts.length === 0;
                        }
                    }
                }
            }

        }

    }
})();
