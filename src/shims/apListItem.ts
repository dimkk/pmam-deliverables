/// <reference path="../../typings/tsd.d.ts" />

module app {
    export interface IListItem {
        id?:number;
        created?:Date;
        modified?:Date;
        author?:ap.User;
        editor?:ap.User;
        permMask?:string;
        uniqueId?:string;
        fileRef?:ap.Lookup;

        deleteAttachment(url:string): ng.IPromise<any>;
        deleteItem(options?:ap.ListItemCrudOptions): ng.IPromise<any>;
        getAttachmentCollection(): ng.IPromise<string[]>;
        getAvailableWorkflows(): ng.IPromise<ap.WorkflowDefinition[]>;
        getFieldChoices(fieldName:string): string[];
        getFieldDefinition(fieldName:string): ap.FieldDefinition;
        getFieldDescription(fieldName:string): string;
        getFieldLabel(fieldName:string): string;
        getFieldVersionHistory(fieldNames:string|string[]): ng.IPromise<ap.ListItemVersion>;
        getFormattedValue(fieldName:string, options:Object): string;
        getLookupReference(fieldName:string, lookupId:number): ListItem;
        resolvePermissions(): ap.UserPermissionsObject;
        saveChanges(options?:ap.ListItemCrudOptions): ng.IPromise<ListItem>;
        saveFields(fieldArray:string[], options?:ap.ListItemCrudOptions): ng.IPromise<ListItem>;
        startWorkflow(options:ap.StartWorkflowParams): ng.IPromise<any>;
        validateEntity(options?:Object): boolean;

        //Added by Model Instantiation
        getModel?():ap.Model;
        getList?():ap.List;
        getListId?():string;
    }

    export class ListItem implements IListItem {
        id;
        created;
        modified;
        author;
        editor;
        permMask;
        uniqueId;
        fileRef;
        static $inject = ['$q', '_', 'apCacheService', 'apDataService', 'apEncodeService', 'apUtilityService',
            'apFormattedFieldValueService', 'apConfig'];

        constructor(private $q, private _, private apCacheService, private apDataService, private apEncodeService,
                    private apUtilityService, private apFormattedFieldValueService, private apConfig) {

        }

        getModel = function():ap.Model{return};
        getList = function():ap.List{return};

        /**
         * @ngdoc function
         * @name ListItem.deleteAttachment
         * @description
         * Delete an attachment from a list item.
         * @param {string} url Requires the URL for the attachment we want to delete.
         * @returns {object} Promise which resolves with the updated attachment collection.
         * @example
         * <pre>
         * $scope.deleteAttachment = function (attachment) {
         *     var confirmation = window.confirm("Are you sure you want to delete this file?");
         *     if (confirmation) {
         *         scope.listItem.deleteAttachment(attachment).then(function () {
         *             alert("Attachment successfully deleted");
         *         });
         *     }
         * };
         * </pre>
         */
        deleteAttachment(url:string):ng.IPromise<any> {
            var listItem = this;
            return this.apDataService.deleteAttachment({
                listItemID: listItem.id,
                url: url,
                listName: listItem.getModel().list.getListId()
            });
        }

        /**
         * @ngdoc function
         * @name ListItem.deleteItem
         * @description
         * Deletes record directly from the object and removes record from user cache.
         * @param {object} [options] Optionally pass params to the dataService.
         * @param {boolean} [options.updateAllCaches=false] Iterate over each of the query cache's and ensure the entity is
         * removed everywhere.  This is more process intensive so by default we only remove the cached entity in the
         * cache where this entity is currently stored.
         * @returns {object} Promise which really only lets us know the request is complete.
         * @example
         * ```
         * <ul>
         *    <li ng-repeat="task in tasks">
         *        {{task.title}} <a href ng-click="task.deleteItem()>delete</a>
         *    </li>
         * </ul>
         * ```
         * List of tasks.  When the delete link is clicked, the list item item is removed from the local cache and
         * the view is updated to no longer show the task.
         */
        deleteItem(options?:ap.ListItemCrudOptions):ng.IPromise<any> {
            var listItem = this;
            var model = listItem.getModel();
            var deferred = this.$q.defer();

            this.apDataService.deleteListItem(model, listItem, options).then((response) => {
                deferred.resolve(response);
                /** Optionally broadcast change event */
                this.apUtilityService.registerChange(model);
            });

            return deferred.promise;
        }

        /**
         * @ngdoc function
         * @name ListItem.getAttachmentCollection
         * @description
         * Requests all attachments for a given list item.
         * @returns {object} Promise which resolves with all attachments for a list item.
         * @example
         * <pre>
         * //Pull down all attachments for the current list item
         * var fetchAttachments = function (listItem) {
         *     listItem.getAttachmentCollection()
         *         .then(function (attachments) {
         *             scope.attachments = attachments;
         *         });
         * };
         * </pre>
         */
        getAttachmentCollection():ng.IPromise<string[]> {
            var listItem = this;
            return this.apDataService.getCollection({
                operation: 'GetAttachmentCollection',
                listName: listItem.getModel().list.getListId(),
                webURL: listItem.getModel().list.webURL,
                ID: listItem.id,
                filterNode: 'Attachment'
            });
        }

        /**
         * @ngdoc function
         * @name ListItem.getAvailableWorkflows
         * @description
         * Wrapper for apDataService.getAvailableWorkflows.  Simply passes the current item in.
         * @returns {promise} Array of objects defining each of the available workflows.
         */
        getAvailableWorkflows():ng.IPromise<ap.WorkflowDefinition[]> {
            var listItem = this;
            return this.apDataService.getAvailableWorkflows(listItem.fileRef.lookupValue);
        }

        /**
         * @ngdoc function
         * @name ListItem.getFieldChoices
         * @param {string} fieldName Internal field name.
         * @description
         * Uses the field definition defined in the model to attempt to find the choices array for a given Lookup or
         * MultiLookup type field.  The default value is fieldDefinition.choices which can optionally be added to a
         * given field definition.  If this isn't found, we check fieldDefinition.Choices which is populated after a
         * GetListItemsSinceToken operation or a Model.extendListMetadata operation.  Finally if that isn't available
         * we return an empty array.
         * @returns {string[]} An array of choices for a Choice or MultiChoice type field.
         */
        getFieldChoices(fieldName:string):string[] {
            var listItem = this;
            var fieldDefinition = listItem.getFieldDefinition(fieldName);
            return fieldDefinition.choices || fieldDefinition.Choices || [];
        }

        /**
         * @ngdoc function
         * @name ListItem.getFieldDefinition
         * @description
         * Returns the field definition from the definitions defined in the custom fields array within a model.
         * @example
         * <pre>
         * var project = {
         *    title: 'Project 1',
         *    location: {
         *        lookupId: 5,
         *        lookupValue: 'Some Building'
         *    }
         * };
         *
         * //To get field metadata
         * var locationDefinition = project.getFieldDefinition('location');
         * </pre>
         * @param {string} fieldName Internal field name.
         * @returns {object} Field definition.
         */
        getFieldDefinition(fieldName:string):ap.FieldDefinition {
            var listItem = this;
            return listItem.getModel().getFieldDefinition(fieldName);
        }

        /**
         * @ngdoc function
         * @name ListItem.getFieldDescription
         * @param {string} fieldName Internal field name.
         * @description
         * Uses the field definition defined in the model to attempt to find the description for a given field.  The default
         * value is fieldDefinition.Description which is populated after a GetListItemsSinceToken operation or a
         * Model.extendListMetadata operation.  If this isn't available we look for an optional attribute of a field
         * fieldDefinition.description.  Finally if that have anything it returns an empty string.
         * @returns {string} The description for a given field object.
         */
        getFieldDescription(fieldName:string):string {
            var listItem = this;
            var fieldDefinition = listItem.getFieldDefinition(fieldName);
            return fieldDefinition.description || fieldDefinition.Description || '';
        }

        /**
         * @ngdoc function
         * @name ListItem.getFieldLabel
         * @param {string} fieldName Internal field name.
         * @description
         * Uses the field definition defined in the model to attempt to find the label for a given field.  The default
         * value is fieldDefinition.label.  If not available it will then use fieldDefinition.DisplayName which is
         * populated after a GetListItemsSinceToken operation or a Model.extendListMetadata operation.  If this isn't
         * available it will fallback to the the fieldDefinition.DisplayName which is a best guess at converting the
         * caml case version of the mapped name using apUtilityService.fromCamelCase.
         * @returns {string} The label for a given field object.
         */
        getFieldLabel(fieldName:string):string {
            var listItem = this;
            var fieldDefinition = listItem.getFieldDefinition(fieldName);
            return fieldDefinition.label || fieldDefinition.DisplayName || fieldDefinition.displayName;
        }

        /**
         * @ngdoc function
         * @name ListItem.getFieldVersionHistory
         * @description
         * Takes an array of field names, finds the version history for field, and returns a snapshot of the object at each
         * version.  If no fields are provided, we look at the field definitions in the model and pull all non-readonly
         * fields.  The only way to do this that I've been able to get working is to get the version history for each
         * field independently and then build the history by combining the server responses for each requests into a
         * snapshot of the object.
         * @param {string[]} [fieldNames] An array of field names that we're interested in.
         * @returns {object} promise - containing array of changes
         * @example
         * Assuming we have a modal form where we want to display each version of the title and project fields
         * of a given list item.
         * <pre>
         * myGenericListItem.getFieldVersionHistory(['title', 'project'])
         *     .then(function(versionHistory) {
         *            // We now have an array of every version of these fields
         *            $scope.versionHistory = versionHistory;
         *      };
         * </pre>
         */
        getFieldVersionHistory(fieldNames:string|string[]):ng.IPromise<ap.ListItemVersion> {
            var deferred = this.$q.defer();
            var promiseArray = [];
            var listItem = this;
            var model = listItem.getModel();

            /** Constructor that creates a promise for each field */
            var createPromise = (fieldName) => {

                var fieldDefinition = _.findWhere(model.list.fields, {mappedName: fieldName});

                var payload = {
                    operation: 'GetVersionCollection',
                    strlistID: model.list.getListId(),
                    strlistItemID: listItem.id,
                    strFieldName: fieldDefinition.staticName
                };

                /** Manually set site url if defined, prevents SPServices from making a blocking call to fetch it. */
                if (this.apConfig.defaultUrl) {
                    payload.webURL = this.apConfig.defaultUrl;
                }

                promiseArray.push(this.apDataService.getFieldVersionHistory(payload, fieldDefinition));
            };

            if (!fieldNames) {
                /** If fields aren't provided, pull the version history for all NON-readonly fields */
                var targetFields = _.where(model.list.fields, {readOnly: false});
                fieldNames = [];
                _.each(targetFields, (field) => {
                    fieldNames.push(field.mappedName);
                });
            } else if (_.isString(fieldNames)) {
                /** If a single field name is provided, add it to an array so we can process it more easily */
                fieldNames = [fieldNames];
            }

            /** Generate promises for each field */
            _.each(fieldNames, (fieldName) => {
                createPromise(fieldName);
            });

            /** Pause until all requests are resolved */
            this.$q.all(promiseArray).then((changes) => {
                var versionHistory = {};

                /** All fields should have the same number of versions */
                _.each(changes, (fieldVersions) => {

                    _.each(fieldVersions, (fieldVersion) => {
                        versionHistory[fieldVersion.modified.toJSON()] =
                            versionHistory[fieldVersion.modified.toJSON()] || {};

                        /** Add field to the version history for this version */
                        _.extend(versionHistory[fieldVersion.modified.toJSON()], fieldVersion);
                    });
                });

                var versionArray = [];
                /** Add a version prop on each version to identify the numeric sequence */
                _.each(versionHistory, (ver, num) => {
                    ver.version = num;
                    versionArray.push(ver);
                });

                deferred.resolve(versionArray);
            });

            return deferred.promise;
        }

        /**
         * @ngdoc function
         * @name ListItem.getFormattedValue
         * @description
         * Given the attribute name on an entity, we can lookup the field type and from there return a formatted
         * string representation of that value.
         * @param {string} fieldName Attribute name on the object that contains the value to stringify.
         * @param {object} [options] Pass through to apFormattedFieldValueService.getFormattedFieldValue.
         * @returns {string} Formatted string representing the field value.
         */
        getFormattedValue(fieldName:string, options:Object):string {
            var listItem = this;
            var fieldDefinition = listItem.getFieldDefinition(fieldName);
            if (!fieldDefinition) {
                throw 'A field definition for a field named ' + fieldName + ' wasn\'t found.';
            }
            return this.apFormattedFieldValueService
                .getFormattedFieldValue(listItem[fieldName], fieldDefinition.objectType, options);
        }

        /**
         * @ngdoc function
         * @name ListItem.getLookupReference
         * @description
         * Allows us to retrieve the entity being referenced in a given lookup field.
         * @param {string} fieldName Name of the lookup property on the list item that references an entity.
         * @param {number} [lookupId=listItem.fieldName.lookupId] The listItem.lookupId of the lookup object.  This allows us to also use this logic
         * on a multi-select by iterating over each of the lookups.
         * @example
         * <pre>
         * var project = {
         *    title: 'Project 1',
         *    location: {
         *        lookupId: 5,
         *        lookupValue: 'Some Building'
         *    }
         * };
         *
         * //To get the location entity
         * var entity = project.getLookupReference('location');
         * </pre>
         * @returns {object} The entity the lookup is referencing or undefined if not in the cache.
         */
        getLookupReference(fieldName:string, lookupId:number):ListItem {
            var listItem = this;
            if (_.isUndefined(fieldName)) {
                throw 'A field name is required.', fieldName;
            } else if (_.isEmpty(listItem[fieldName])) {
                return '';
            } else {
                var model = listItem.getModel();
                var fieldDefinition = model.getFieldDefinition(fieldName);
                /** Ensure the field definition has the List attribute which contains the GUID of the list
                 *  that a lookup is referencing. */
                if (fieldDefinition && fieldDefinition.List) {
                    var targetId = lookupId || listItem[fieldName].lookupId;
                    return this.apCacheService.getCachedEntity(fieldDefinition.List, targetId);
                } else {
                    throw 'This isn\'t a valid Lookup field or the field definitions need to be extended ' +
                    'before we can complete this request.', fieldName, lookupId;
                }
            }
        }

        /**
         * @ngdoc function
         * @name ListItem.resolvePermissions
         * @description
         * See apModelService.resolvePermissions for details on what we expect to have returned.
         * @returns {Object} Contains properties for each permission level evaluated for current user.
         * @example
         * Lets assume we're checking to see if a user has edit rights for a given task list item.
         * <pre>
         * var canUserEdit = function(task) {
         *      var userPermissions = task.resolvePermissions();
         *      return userPermissions.EditListItems;
         * };
         * </pre>
         * Example of what the returned object would look like
         * for a site admin.
         * <pre>
         * userPermissions = {
         *    "ViewListItems":true,
         *    "AddListItems":true,
         *    "EditListItems":true,
         *    "DeleteListItems":true,
         *    "ApproveItems":true,
         *    "OpenItems":true,
         *    "ViewVersions":true,
         *    "DeleteVersions":true,
         *    "CancelCheckout":true,
         *    "PersonalViews":true,
         *    "ManageLists":true,
         *    "ViewFormPages":true,
         *    "Open":true,
         *    "ViewPages":true,
         *    "AddAndCustomizePages":true,
         *    "ApplyThemeAndBorder":true,
         *    "ApplyStyleSheets":true,
         *    "ViewUsageData":true,
         *    "CreateSSCSite":true,
         *    "ManageSubwebs":true,
         *    "CreateGroups":true,
         *    "ManagePermissions":true,
         *    "BrowseDirectories":true,
         *    "BrowseUserInfo":true,
         *    "AddDelPrivateWebParts":true,
         *    "UpdatePersonalWebParts":true,
         *    "ManageWeb":true,
         *    "UseRemoteAPIs":true,
         *    "ManageAlerts":true,
         *    "CreateAlerts":true,
         *    "EditMyUserInfo":true,
         *    "EnumeratePermissions":true,
         *    "FullMask":true
         * }
         * </pre>
         */
        resolvePermissions():ap.UserPermissionsObject {
            var listItem = this;
            return this.apUtilityService.resolvePermissions(listItem.permMask);
        }

        /**
         * @ngdoc function
         * @name ListItem.saveChanges
         * @description
         * Updates record directly from the object
         * @param {object} [options] Optionally pass params to the data service.
         * @param {boolean} [options.updateAllCaches=false] Search through the cache for each query to ensure entity is
         * updated everywhere.  This is more process intensive so by default we only update the cached entity in the
         * cache where this entity is currently stored.
         * @returns {object} Promise which resolved with the updated list item from the server.
         * @example
         * <pre>
         * // Example of save function on a fictitious
         * // app/modules/tasks/TaskDetailsCtrl.js modal form.
         * $scope.saveChanges = function(task) {
         *      task.saveChanges().then(function() {
         *          // Successfully saved so we can do something
         *          // like close form
         *
         *          }, function() {
         *          // Failure
         *
         *          });
         * }
         * </pre>
         */
        saveChanges(options?:ap.ListItemCrudOptions):ng.IPromise<ListItem> {
            var listItem = this;
            var model = listItem.getModel();
            var deferred = this.$q.defer();

            /** Redirect if the request is actually creating a new list item.  This can occur if we create
             * an empty item that is instantiated from the model and then attempt to save instead of using
             * model.addNewItem */
            if (!listItem.id) {
                return model.addNewItem(listItem, options);
            }

            this.apDataService.updateListItem(model, listItem, options)
                .then((response) => {
                    deferred.resolve(response);
                    /** Optionally broadcast change event */
                    this.apUtilityService.registerChange(model);
                });

            return deferred.promise;
        }


        /**
         * @ngdoc function
         * @name ListItem.saveFields
         * @description
         * Saves a named subset of fields back to SharePoint.  This is an alternative to saving all fields.
         * @param {array|string} fieldArray Array of internal field names that should be saved to SharePoint or a single
         * string to save an individual field.
         * @param {object} [options] Optionally pass params to the data service.
         * @param {boolean} [options.updateAllCaches=false] Search through the cache for each query to ensure entity is
         * updated everywhere.  This is more process intensive so by default we only update the cached entity in the
         * cache where this entity is currently stored.
         * @returns {object} Promise which resolves with the updated list item from the server.
         * @example
         * <pre>
         * // Example of saveFields function on a fictitious
         * // app/modules/tasks/TaskDetailsCtrl.js modal form.
         * // Similar to saveChanges but instead we only save
         * // specified fields instead of pushing everything.
         * $scope.updateStatus = function(task) {
         *      task.saveFields(['status', 'notes']).then(function() {
         *          // Successfully updated the status and
         *          // notes fields for the given task
         *
         *          }, function() {
         *          // Failure to update the field
         *
         *          });
         * }
         * </pre>
         */
        saveFields(fieldArray:string[], options?:ap.ListItemCrudOptions):ng.IPromise<ListItem> {

            var listItem = this;
            var model = listItem.getModel();
            var deferred = this.$q.defer();
            var definitions = [];
            /** Allow a string to be passed in to save a single field */
            var fieldNames = _.isString(fieldArray) ? [fieldArray] : fieldArray;
            /** Find the field definition for each of the requested fields */
            _.each(fieldNames, (field) => {
                var match = _.findWhere(model.list.customFields, {mappedName: field});
                if (match) {
                    definitions.push(match);
                }
            });

            /** Generate value pairs for specified fields */
            var valuePairs = this.apEncodeService.generateValuePairs(definitions, listItem);

            var defaults = {buildValuePairs: false, valuePairs: valuePairs};

            /** Extend defaults with any provided options */
            var opts = _.extend({}, defaults, options);

            this.apDataService.updateListItem(model, listItem, opts)
                .then((response) => {
                    deferred.resolve(response);
                    /** Optionally broadcast change event */
                    this.apUtilityService.registerChange(model);
                });

            return deferred.promise;
        }

        /**
         * @ngdoc function
         * @name ListItem.startWorkflow
         * @description
         * Given a workflow name or templateId we initiate a given workflow using apDataService.startWorkflow.
         * @param {object} options Params for method and pass through options to apDataService.startWorkflow.
         * @param {string} [options.templateId] Used to directly start the workflow without looking up the templateId.
         * @param {string} [options.workflowName] Use this value to lookup the templateId and then start the workflow.
         * @returns {promise} Resolves with server response.
         */
        startWorkflow(options:ap.StartWorkflowParams):ng.IPromise<any> {
            var listItem = this,
                deferred = this.$q.defer();

            var initiateRequest = () => {
                this.apDataService.startWorkflow(options)
                    .then((xmlResponse) => {
                        deferred.resolve(xmlResponse);
                    });
            }

            /** Set the relative file reference */
            options.fileRef = listItem.fileRef.lookupValue;

            if (!options.templateId && !options.workflowName) {
                throw 'Either a templateId or workflowName is required to initiate a workflow.';
            } else if (options.templateId) {
                /** The templateId is already provided so we don't need to look for it */
                initiateRequest();
            } else {
                /** We first need to get the template GUID for the workflow */
                listItem.getAvailableWorkflows()
                    .then((workflows) => {
                        var targetWorklow = _.findWhere(workflows, {name: options.workflowName});
                        if (!targetWorklow) {
                            throw 'A workflow with the specified name wasn\'t found.';
                        }
                        /** Create an extended set of options to pass any overrides to apDataService */
                        options.templateId = targetWorklow.templateId;
                        initiateRequest();
                    });
            }

            return deferred.promise;


        }

        /**
         * @ngdoc function
         * @name ListItem.validateEntity
         * @description
         * Helper function that passes the current item to Model.validateEntity
         * @param {object} [options] Optionally pass params to the dataService.
         * @param {boolean} [options.toast=true] Set to false to prevent toastr messages from being displayed.
         * @returns {boolean} Evaluation of validity.
         */
        validateEntity(options?:Object): boolean {
            var listItem = this,
                model = listItem.getModel();
            return model.validateEntity(listItem, options);
        }

    }

    angular
        .module('pmam-deliverables')
        .service('apListItem', ListItem);

}
