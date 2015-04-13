/// <reference path="../../../typings/app.d.ts" />
module app {
    'use strict';


    var model:DeliverableFeedbackModel, apLookupCacheService, $modal, userService:UserService, toastr, user:IUser;

    /**
     * @ngdoc function
     * @name DeliverableFeedback
     * @description
     * Entity Constructor
     * @param {object} obj New entity to extend.
     * @constructor
     */
    export class DeliverableFeedback extends ap.ListItem {
        acceptable:boolean;
        comments:string;
        definition:ap.ILookup;
        deliverable:ap.ILookup;
        fy:number;
        rating:number;
        title:string;

        _deleteItem();

        constructor(obj) {
            super();
            _.assign(this, obj);
            var self = this;

            if (self.id) {
                /** Store in cached object so we can reference from lookup reference */
                apLookupCacheService.cacheEntityByLookupId(self, model.lookupFieldsToCache);
                /** Modify standard delete logic so we can remove from cache prior to actually deleting */
                self._deleteItem = self.deleteItem;
                self.deleteItem = function () {
                    apLookupCacheService.removeEntityFromLookupCaches(self, model.lookupFieldsToCache);
                    return self._deleteItem();
                }
            }

        }

        openModal() {
            var userFeedback = this;

            var userCanReview = userService.userCanReview();
            if (!userCanReview && !userFeedback.id) {
                /** Don't allow users without necessary permission create reviews */
                return toastr.warning('Only members of the "ESED Deliverables Reviewers" group may submit reviews.');
            }

            var backup = angular.copy(userFeedback);
            var modalInstance = $modal.open({
                templateUrl: 'modules/deliverable_feedback/deliverableFeedbackModalView.html',
                controller: 'feedbackModalController',
                controllerAs: 'vm',
                resolve: {
                    userFeedback: function () {
                        return userFeedback;
                    },
                    isAuthor: function () {
                        /** This is the author if there is no author because it hasn't been saved or the author's id matches the current users id */
                        return !userFeedback.author || userFeedback.author.lookupId === user.lookupId
                    }
                }
            });

            modalInstance.result
                .then(function (updatedFeedback) {
                    //User updated feedback so no action necessary
                }, function () {
                    //Revert back to backup state of feedback because user cancelled
                    _.extend(userFeedback, backup);
                });

            return modalInstance.result;

        }

    }


    export class DeliverableFeedbackModel extends ap.Model {
        lookupFieldsToCache = ['deliverable'];
        constructor(_$modal_, _userService_, _toastr_, _user_, _apLookupCacheService_:ap.apLookupCacheService, ListItemFactory, ModelFactory) {
            $modal = _$modal_;
            apLookupCacheService = _apLookupCacheService_;
            model = this;
            toastr = _toastr_;
            user = _user_;
            userService = _userService_;


            /********************* Model Definition ***************************************/

            /**
             * @ngdoc object
             * @name deliverableFeedbackModel.model
             * @description
             *  Model Constructor
             */
            super({
                factory: DeliverableFeedback,
                /**
                 * @ngdoc object
                 * @name deliverableFeedbackModel.list
                 * @description
                 *  Contains
                 *
                 *  - list.title (Maps to the offline XML file in dev folder (no spaces))
                 *  - list.guid (GUID can be found in list properties in SharePoint designer)
                 *  - list.customFields
                 *  @requires apListFactory
                 */
                list: {
                    title: 'DeliverableFeedback',
                    /**Maps to the offline XML file in dev folder (no spaces) */
                    guid: '{00A69513-BB63-4333-9639-EB14C08269DB}',
                    /**List GUID can be found in list properties in SharePoint designer */
                    customFields: [
                    /** Array of objects mapping each SharePoint field to a property on a list item object */
                    /** If OneApp live templates have been imported type 'oafield' followed by the tab key for
                     /*  each field to quickly map with available options */
                        {staticName: 'Title', objectType: 'Text', mappedName: 'title', readOnly: false},
                        {staticName: 'Comments', objectType: 'Note', mappedName: 'comments', readOnly: false},
                    /** FY is October - September (Actually a string in SharePoint but we call it Integer for automatic type conversion*/
                        {staticName: "FY", objectType: "Integer", mappedName: "fy", readOnly: false},
                        {staticName: 'Acceptable', objectType: 'Boolean', mappedName: 'acceptable', readOnly: false},
                        {
                            staticName: 'DeliverableDefinition',
                            objectType: 'Lookup',
                            mappedName: 'definition',
                            readOnly: false
                        },
                        {staticName: 'Deliverable', objectType: 'Lookup', mappedName: 'deliverable', readOnly: false},
                        {staticName: 'Rating', objectType: 'Integer', mappedName: 'rating', readOnly: false}
                    ]
                }
            });

        }

        /**
         * @description Pulls cached feedback for a given deliverable.
         * @param {number} deliverableId
         * @param {boolean} [asObject=false]  Optionally prevent conversion to an array.
         * @returns {DeliverableFeedback[]} Array of matching feedback for a given deliverable.
         */
        getCachedFeedbackByDeliverableId(deliverableId, asObject) {
            return apLookupCacheService.retrieveLookupCacheById('deliverable', model.list.getListId(), deliverableId, asObject);
        }


        getFyFeedback(fy) {
            /** Unique query name (ex: fy2013) */
            var fyCacheKey = 'fy' + fy;

            /** Register fy query if it doesn't exist */
            if (!_.isObject(model.queries[fyCacheKey])) {
                model.registerQuery({
                    name: fyCacheKey,
                    query: '' +
                    '<Query>' +
                    '   <Where>' +
                    /** Return all records for this FY */
                    '       <Eq>' +
                    '           <FieldRef Name="FY"/>' +
                    '           <Value Type="Text">' + fy + '</Value>' +
                    '       </Eq>' +
                    '   </Where>' +
                    '</Query>'
                });
            }

            return model.executeQuery(fyCacheKey);
        }

    }

    /**
     * @ngdoc service
     * @name deliverableFeedbackModel
     * @model
     * @description
     *
     *
     * @requires apModelFactory
     */
    angular
        .module('pmam-deliverables')
        .service('deliverableFeedbackModel', DeliverableFeedbackModel);


}
