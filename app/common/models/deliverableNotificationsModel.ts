/// <reference path="../../../typings/app.d.ts" />
module app {
    'use strict';
    var model:DeliverableNotificationsModel;

    export class DeliverableNotification extends ap.ListItem{
        body:string;
        cc:ap.IUser[];
        deliverableReference:ap.ILookup;
        title:string;
        to:ap.IUser[];
        constructor(obj) {
            _.assign(this, obj);
        }
    }

    export class DeliverableNotificationsModel extends ap.Model{
        constructor(private toastr, apListItemFactory, apModelFactory) {

            /********************* Model Definition ***************************************/
            model = this;
            super({
                factory: DeliverableNotification,
                /**
                 * @ngdoc object
                 * @name DeliverableNotificationsModel.list
                 * @description
                 *  Contains
                 *
                 *  - list.title (Maps to the offline XML file in dev folder (no spaces))
                 *  - list.guid (GUID can be found in list properties in SharePoint designer)
                 *  - list.customFields
                 *  @requires apListFactory
                 */
                list: {
                    /**Maps to the offline XML file in dev folder (no spaces) */
                    title: 'DeliverableNotifications',
                    /**List GUID can be found in list properties in SharePoint designer */
                    guid: '{29465570-F5AC-4716-B3E2-8E2C55CF9351}',
                    customFields: [
                        {
                            staticName: 'Title',
                            objectType: 'Text',
                            mappedName: 'subject',
                            readOnly: false,
                            description: 'Subject of email notification.'
                        },
                        {
                            staticName: 'To',
                            objectType: 'UserMulti',
                            mappedName: 'to',
                            readOnly: false,
                            description: 'Recipients of email notification on the "To" line.'
                        },
                        {
                            staticName: 'CC',
                            objectType: 'UserMulti',
                            mappedName: 'cc',
                            readOnly: false,
                            description: 'Recipients of email notification on the "CC" line.'
                        },
                        {
                            staticName: 'Body',
                            objectType: 'Note',
                            mappedName: 'body',
                            readOnly: false,
                            description: 'Email body.'
                        },
                        {
                            staticName: 'DeliverableReference',
                            objectType: 'Lookup',
                            mappedName: 'deliverableReference',
                            readOnly: false,
                            description: 'Reference to the parent deliverable list item.'
                        }
                    ]
                }
            });

            /*********************************** Factory and Methods ***************************************/


            /*********************************** Queries ***************************************/

            /** Fetch data (pulls local xml if offline named model.list.title + '.xml')
             *  Initially pulls all requested data.  Each subsequent call just pulls records that have been changed,
             *  updates the model, and returns a reference to the updated data array
             * @returns {Array} Requested list items
             */
            this.registerQuery({ name: 'primary' });

        }



        generateReviewNotificationBody(deliverable:Deliverable) {
            var emailBody = `<p>A new ${deliverable.deliverableType.lookupValue} has been uploaded to the PM-Ammo
            Deliverable Tracker and is ready for your review.</p>

            <div>STEPS TO COMPLETE TASK</div>
            <ol>
                <li>Open the "Deliverable Dashboard" link below.</li>
                <li>Review applicable file(s) linked in the "Attachments" section.</li>
                <li>Provide input regarding acceptability using the review controlls on the
                right side of the page.</li>
            </ol>

            ${model.generateDocumentDetails(deliverable)}`;

            return emailBody;
        }

        generateNewDeliverableNotification(deliverable:Deliverable) {
            if (!deliverable) {
                throw new Error('Can\'t send a notification without a deliverable.');
            }

            var emailSubject = model.generateEmailSubject(deliverable);
            var emailBody = model.generateReviewNotificationBody(deliverable);

            var notification = {
                /** Expecting "to" to be a User array */
                to: deliverable.to,
                subject: emailSubject,
                body: emailBody,
                cc: deliverable.cc,
                deliverableReference: {lookupId: deliverable.id}
            };

            var notification = model.createEmptyItem(notification);

            return notification.saveChanges()
                .then(function () {
                    model.toastr.success('Email notification successfully generated.');
                }, function () {
                    model.toastr.error('Deliverable notification failed to be created.  Please notify one' +
                    ' of the deliverable coordinators.');
                });
        }


        generateDocumentDetails(deliverable:Deliverable) {
            return `<div>Name: ${deliverable.title}</div>
                    <div>Type: ${deliverable.deliverableType.lookupValue}</div>
                    <div>Submission Date: ${moment(deliverable.submissionDate).format('dddd MMM Do YYYY')}</div>
                    <div>Due Date: ${deliverable.dueDate ? moment(deliverable.dueDate).format('dddd MMM Do YYYY') : 'N/A'}</div>
                    <div>Attachment Count: ${deliverable.attachments.length}</div>
                    <div>Details: ${deliverable.details}</div>

                    <div>Deliverable Dashboard:</div>
                    <div>${model.generateDashboardUrl(deliverable)}</div>`;
        }

        generateDashboardUrl(deliverable:Deliverable) {
            return window.location.protocol + "//" + window.location.hostname + window.location.pathname + '#/deliverable/' + deliverable.id;
        }


        generateEmailSubject(deliverable) {
            return `New Deliverable Notification - ${model.generateDashboardUrl(deliverable)}`;
        }

    }


    /**
     * @ngdoc service
     * @name DeliverableNotificationsModel
     * @model
     */
    angular
        .module('pmam-deliverables')
        .service('deliverableNotificationsModel', DeliverableNotificationsModel);

}
