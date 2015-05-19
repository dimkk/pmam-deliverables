/// <reference path="../../../typings/app.d.ts" />
module app {
    'use strict';

    var model: DeliverableAccessMetricsModel,
        user: IUser,
        userService: UserService;

    /** Simple object with keys = DeliverableID and val = corresponding access log */
    var cachedAccessMetrics: { [key: number]:DeliverableAccessMetric } = {};

    interface IAccessEvent {
        closed: Date;
        contributor: boolean;
        opened: Date;
        reviewer: boolean;
        userId: number;
        userName: string;
    }

    export class DeliverableAccessMetric extends ap.ListItem {
        accessEvents: IAccessEvent[];
        deliverable: ap.ILookup;
        fy: number;

        constructor(obj) {
            _.assign(this, obj);

            if (this.id) {
                /** Add record to cache */
                cachedAccessMetrics[this.deliverable.lookupId] = this;
            }

        }

        /**
         * @description Adds a new access event to the event array.
         * @param {Date} opened
         * @param {Date} closed
         * @returns {ng.IPromise<DeliverableAccessMetric>}
         */
        registerAccessEvent(opened: Date, closed: Date): ng.IPromise<DeliverableAccessMetric> {
            /** Ensure access events is a valid array */
            this.accessEvents = this.accessEvents || [];
            this.accessEvents.push({
                closed: closed,
                contributor: userService.userCanContribute(),
                opened: opened,
                reviewer: userService.userCanReview(),
                userId: user.lookupId,
                userName: user.lookupValue
            });
            return this.saveChanges();
        }


    }

    export class DeliverableAccessMetricsModel extends ap.Model {
        cachedFyRequests = {};

        constructor($injector) {
            model = this;
            user = $injector.get('user');
            userService = $injector.get('userService');

            super({
                factory: DeliverableAccessMetric,
                /**
                 * @ngdoc object
                 * @name DeliverableAccessMetricsModel.list
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
                    title: 'DeliverableAccessMetrics',
                    /**List GUID can be found in list properties in SharePoint designer */
                    guid: '{62BE72FF-B48A-41C8-AB71-251102E212E6}',
                    customFields: [
                        {
                            staticName: 'Deliverable',
                            objectType: 'Lookup',
                            mappedName: 'deliverable',
                            description: 'Selected deliverable.',
                            readOnly: false
                        },
                    /** We index this field in SharePoint to speed up response times */
                        {
                            staticName: 'FY',
                            objectType: 'Integer',
                            mappedName: 'fy',
                            description: 'Fiscal year of referenced deliverable.',
                            readOnly: false
                        },
                        {
                            staticName: 'AccessEvents',
                            objectType: 'JSON',
                            mappedName: 'accessEvents',
                            description: 'JSON event array containing the user who accessed the deliverable and date/time of event.',
                            readOnly: false
                        }
                    ]
                }
            });

        }

        /**
         * @description Returns the cached access metrics for a given deliverable or undefined if one isn't available
         * @param deliverableId
         * @returns {DeliverableAccessMetric}
         */
         getCachedAccessMetricsByDeliverableId(deliverableId: number): DeliverableAccessMetric {
            return cachedAccessMetrics[deliverableId];
        }


        /**
         * @name DeliverableAccessMetricsModel.getFyDefinitions
         * @description Makes a single request for deliverable access logs for a given FY.  All subsequent requests
         * return a cached promise that resolves with the original indexedCache.
         * @param {number} fy Fiscal Year
         * @returns {*}
         */
        getFyAccessMetrics(fy: number): ap.IIndexedCache<DeliverableFeedback> {
            /** Unique query name (ex: fy2013) */
            var fyCacheKey = 'fy' + fy;

            /** Make request from server is fy request hasn't already been made */
            if (!model.cachedFyRequests[fy]) {
                /** Register dynamic query with model */
                model.registerQuery({
                    name: fyCacheKey,
                    operation: 'GetListItems',
                    query: '' +
                    /** Return all records for this FY */
                    `<Query>
                       <Where>
                           <Eq>
                               <FieldRef Name="FY"/>
                               <Value Type="Text">${fy}</Value>
                           </Eq>
                       </Where>
                    </Query>`
                });

                /** Cache promise so we can return for future calls */
                model.cachedFyRequests[fy] = model.executeQuery(fyCacheKey);

            }

            /** Return cached promise */
            return model.cachedFyRequests[fy];
        }

    }

    /**
     * @ngdoc service
     * @name DeliverableAccessMetricsModel
     * @model
     * @description
     * Log to capture number of times a given deliverable has been accessed.
     *
     */
    angular
        .module('pmam-deliverables')
        .service('deliverableAccessMetricsModel', DeliverableAccessMetricsModel);

}
