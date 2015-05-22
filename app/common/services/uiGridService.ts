/// <reference path="../../../typings/app.d.ts" />
module app {
    'use strict';

    var service:UIGridService;


    /**
     * @ngdoc service
     * @name uiGridService
     * @description
     *
     */
    class UIGridService{
        iconWidth = 100;
        constructor() {
            service = this;
        }

        getDeliverableFields() {
            var deliverableFields = [
                {
                    displayName: 'Title',
                    field: 'title',
                    width: '30%',
                    cellTemplate: ''+
                    `<div class="ui-grid-cell-contents">
                        <a ui-sref="deliverable({id:row.entity.id,task: 'All'})"   title="View this deliverable">{{ row.entity.title }}</a>
                    </div>`
                },
                {
                    displayName: 'Type',
                    width: '15%',
                    field: 'deliverableType.lookupValue',
                    cellTemplate: `
                    <div class="ui-grid-cell-contents">
                        <a ui-sref="deliverables.instances({fy:row.entity.fy, id:row.entity.deliverableType.lookupId})"
                            title="View all deliverables of this type">{{ row.entity.deliverableType.lookupValue }}</a>
                    </div>`
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
                    width: service.iconWidth,
                    cellTemplate: `
                    <div class="ui-grid-cell-contents">
                        <on-time-check-mark data-deliverable="row.entity"></on-time-check-mark>
                    </div>`
                },
                {
                    displayName: 'Acceptable',
                    field: 'acceptable',
                    width: service.iconWidth,
                    cellTemplate: `
                    <div class="ui-grid-cell-contents">
                        <rating-stoplight data-deliverable="row.entity"></rating-stoplight>
                    </div>`
                },
                discussionThread(),
                {
                    displayName: 'Views',
                    field: 'getViewCount()',
                    width: service.iconWidth,
                    cellTemplate: `
                    <div class="ui-grid-cell-contents">
                        <span class="badge">{{row.entity.getViewCount()}}</span>
                    </div>`
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
      
    }

    /**==================PRIVATE==================*/


    function createColumnDef(model, fieldName, options) {
        var columnDef = {
            name: fieldName,
            field: 'getFormattedValue("' + fieldName + '")',
            filters: undefined
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
        return `
            <div class="ui-grid-cell-contents">
                   <a style="color: #428bca" href ng-click="row.entity.openModal()">
                       {{ grid.getCellValue(row, col) }}
                   </a>
            </div>`;

    }

    function dateField() {
        return `<div class="ui-grid-cell-contents">{{ grid.getCellValue(row, col) | date:'shortDate' }}</div>`;
    }

    function discussionThread() {
        return {
            displayName: 'Discussion',
            field: 'discussionThread.posts.length',
            cellTemplate: '' +
            `<div class="ui-grid-cell-contents">
                <i ng-if="row.entity.discussionThread.posts && row.entity.discussionThread.posts.length > 0"
                    title="Contains an active discussion thread." class="fa fa-comments"></i>
            </div>`,
            filter: {
                type: 'select',
                selectOptions: [{value: 'true', label: 'True'}, {value: 'false', label: 'False'}],
                width: service.iconWidth,
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


    angular
        .module('pmam-deliverables')
        .service('uiGridService', UIGridService);

}
