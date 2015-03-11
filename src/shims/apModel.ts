/// <reference path="../../typings/tsd.d.ts" />

module app {

    export interface IModel {
        deferredListDefinition:ng.IPromise<any>;
        factory:Function;
        list?:ap.List;
        queries?:{[index:string]:ap.Query};
        _cachedIndexes?:{[index:string]:ap.Cache};

        addNewItem?(entity:ap.ListItem, options?:Object): ng.IPromise<ap.ListItem>;
        createEmptyItem?(overrides?:Object): ap.ListItem;
        executeQuery?(queryName?:string, options?:Object): ng.IPromise<ap.IndexedCache>;
        extendListMetadata?(options:Object): ng.IPromise<any>;
        generateMockData?(options?:Object): ap.ListItem[];
        getAllListItems?(): ng.IPromise<ap.IndexedCache>;
        getCache?(queryName:string): ap.Cache;
        getCachedEntity?(entityId:number): ap.ListItem;
        getCachedEntities?(): ap.IndexedCache;
        getFieldDefinition?(fieldName:string): ap.FieldDefinition;
        getListItemById?(entityId:number, options?:Object): ng.IPromise<ap.ListItem>;
        getQuery?(queryName:string): ap.Query;
        isInitialised?(): boolean;
        resolvePermissions?(): ap.UserPermissionsObject;
        registerQuery?(queryOptions:ap.QueryOptions): ap.Query;
        searchLocalCache(value:any|any[], options:{cacheName?:string; localCache:ap.Cache; propertyPath:string;rebuildIndex:boolean}):ap.ListItem|ap.ListItem[];
        validateEntity?(entity:ap.ListItem, options?:Object): boolean;
    }

    export class Model implements IModel {
        static $inject = ['apCacheService', 'apDataService', 'apListFactory', 'apListItemFactory', 'apQueryFactory',
        'apUtilityService', 'apFieldService', 'apConfig', 'apDecodeService', '$q', 'toastr'];
        constructor(_, private apCacheService, private apDataService, apListFactory, private apListItemFactory,
                    private apQueryFactory, private apUtilityService, private apFieldService, private apConfig,
                    private apDecodeService, private $q:ng.IQService, private toastr) {

            var model = this;

            /** Use list constructor to decorate */
            model.list = apListFactory.create(model.list);

            /** Set the constructor's prototype to inherit from ListItem so we can inherit functionality */
            model.factory.prototype = apListItemFactory.create();

            /** Constructor for ListItem is Object so ensure we update to properly reference ListItem */
            model.factory.constructor = apListItemFactory.ListItem;

            /**
             * @ngdoc function
             * @name ListItem.getModel
             * @description
             * Allows us to reference the parent model directly from the list item.  This is added to the
             * model.factory prototype in apModelFactory.  See the [List](#/api/List) documentation for more info.
             * @returns {object} Model for the list item.
             */
            model.factory.prototype.getModel = () => model;

            /**
             * @ngdoc function
             * @name ListItem.getList
             * @description
             * Allows us to reference the list definition directly from a given list item.  This is added to the
             * model.factory prototype in apModelFactory.  See the [List](#/api/List) documentation for more info.
             * @returns {object} List for the list item.
             */
            model.factory.prototype.getList = () => model.list;

            /**
             * @ngdoc function
             * @name ListItem.getListId
             * @description
             * Allows us to reference the list ID directly from the list item.  This is added to the
             * model.factory prototype in apModelFactory.
             * @returns {string} List ID.
             */
            model.factory.prototype.getListId = () => model.list.getListId();

            /** Register cache name with cache service so we can map factory name with list GUID */
            apCacheService.registerModel(model);

            /** Convenience query that simply returns all list items within a list. */
            model.registerQuery({
                name: 'getAllListItems',
                operation: 'GetListItems'
            });

        }

        _cachedIndexes = null;
        data = [];
        deferredListDefinition = null;
        factory = this.apListItemFactory.createGenericFactory();
        fieldDefinitionsExtended = false;
        /** Date/Time of last communication with server */
        lastServerUpdate = null;
        list = null;
        queries = <{[index:string]:ap.Query}>{};
        requestForFieldDefinitions = null;

        /**
         * @ngdoc function
         * @name Model.addNewItem
         * @description
         * Using the definition of a list stored in a model, create a new list item in SharePoint.
         * @param {object} entity An object that will be converted into key/value pairs based on the field definitions
         * defined in the model.
         * @param {object} [options] - Pass additional options to the data service.
         * @returns {object} A promise which when resolved will returned the newly created list item from there server.
         * This allows us to update the view with a valid new object that contains a unique list item id.
         *
         * @example
         * <pre>
         * <file name="app/modules/project/projectsModel.js">
         * projectModel.addNewItem({
         *        title: 'A Project',
         *        customer: {lookupValue: 'My Customer', lookupId: 123},
         *        description: 'This is the project description'
         *     }).then(function(newEntityFromServer) {
         *         //The local query cache is automatically updated but
         *         //any other dependent logic can go here
         * };
         * </file>
         * </pre>
         */
        addNewItem(entity:ap.ListItem, options?:Object):ng.IPromise<ap.ListItem> {
            var model = this,
                deferred = this.$q.defer();

            this.apDataService.createListItem(model, entity, options)
                .then((response) => {
                    deferred.resolve(response);
                    /** Optionally broadcast change event */
                    this.apUtilityService.registerChange(model);
                });
            return deferred.promise;
        }

        /**
         * @ngdoc function
         * @name Model.createEmptyItem
         * @description
         * Creates an object using the editable fields from the model, all attributes are empty based on the field
         * type unless an overrides object is passed in.  The overrides object extends the defaults.  A benefit to this
         * approach is the returned object inherits from the ListItem prototype so we have the ability to call
         * entity.saveChanges instead of calling the model.addNewItem(entity).
         *
         * @param {object} [overrides] - Optionally extend the new empty item with specific values.
         * @returns {object} Newly created list item.
         */
        createEmptyItem(overrides?:Object):ap.ListItem {
            var model = this;
            var newItem = {};
            _.each(model.list.customFields, (fieldDefinition:ap.FieldDefinition) => {
                /** Create attributes for each non-readonly field definition */
                if (!fieldDefinition.readOnly) {
                    /** Create an attribute with the expected empty value based on field definition type */
                    newItem[fieldDefinition.mappedName] = this.apFieldService.getDefaultValueForType(fieldDefinition.objectType);
                }
            });
            /** Extend any values that should override the default empty values */
            var rawObject = _.extend({}, newItem, overrides);
            return new model.factory(rawObject);
        }

        /**
         * @ngdoc function
         * @name Model.executeQuery
         * @description
         * The primary method for retrieving data from a query registered on a model.  It returns a promise
         * which resolves to the local cache after post processing entities with constructors.
         *
         * @param {string} [queryName=defaultQueryName] A unique key to identify this query
         * @param {object} [options] Pass options to the data service.
         * @returns {object} Promise that when resolves returns an array of list items which inherit from ListItem and
         * optionally go through a defined constructor on the model.
         *
         * @example To call the query or check for changes since the last call.
         * <pre>
         * projectModel.executeQuery('MyCustomQuery').then(function(entities) {
         *      //We now have a reference to array of entities stored in the local cache
         *      //These inherit from the ListItem prototype as well as the Project prototype on the model
         *      $scope.subsetOfProjects = entities;
         *  });
         * </pre>
         */
        executeQuery(queryName?:string, options?:Object):ng.IPromise<ap.IndexedCache> {
            var model = this;
            var query = model.getQuery(queryName);
            if (query) {
                return query.execute(options);
            }
        }

        /**
         * @ngdoc function
         * @name Model.extendListMetadata
         * @description
         * Extends the List and Fields with list information returned from the server.  Only runs once and after that
         * returns the existing promise.
         * @param {object} [options] Pass-through options to apDataService.getList
         * @returns {object} Promise that is resolved once the information has been added.
         */
        extendListMetadata(options:Object):ng.IPromise<any> {
            var model = this,
                deferred = this.$q.defer(),
                defaults = {listName: model.list.getListId()};

            /** Only request information if the list hasn't already been extended and is not currently being requested */
            if (!model.deferredListDefinition) {
                /** All Future Requests get this */
                model.deferredListDefinition = deferred.promise;

                var opts = _.extend({}, defaults, options);
                this.apDataService.getList(opts)
                    .then((responseXML) => {
                        this.apDecodeService.extendListMetadata(model, responseXML);
                        deferred.resolve(model);
                    });
            }
            return model.deferredListDefinition;
        }

        /**
         * @ngdoc function
         * @name Model.generateMockData
         * @description
         * Generates 'n' mock records for testing using the field types defined in the model to provide something to visualize.
         *
         * @param {object} [options] Object containing optional parameters.
         * @param {number} [options.quantity=10] The requested number of mock records to return.
         * @param {string} [options.permissionLevel=FullMask] Sets the mask on the mock records to simulate desired
         * permission level.
         * @param {boolean} [options.staticValue=false] By default all mock data is dynamically created but if set,
         * this will cause static data to be used instead.
         */
        generateMockData(options?:{ staticValue:boolean; quantity:number; permissionsLevel:string }):ap.ListItem[] {
            var mockData = [],
                model = this;

            var defaults = {
                quantity: 10,
                staticValue: false,
                permissionLevel: 'FullMask'
            };

            /** Extend defaults with any provided options */
            var opts = _.extend({}, defaults, options);

            _.times(opts.quantity, (count) => {
                var mock = {};
                /** Create an attribute with mock data for each field */
                _.each(model.list.fields, (field:ap.FieldDefinition) => {
                    mock[field.mappedName] = field.getMockData(opts);
                });
                mock.id = count + 1;
                /** Use the factory on the model to extend the object */
                mockData.push(new model.factory(mock));
            });
            return mockData;
        }

        /**
         * @ngdoc function
         * @name Model.getAllListItems
         * @description
         * Inherited from Model constructor
         * Gets all list items in the current list, processes the xml, and caches the data in model.
         * @returns {object} Promise returning all list items when resolved.
         * @example
         * <pre>
         * //Taken from a fictitious projectsModel.js
         * projectModel.getAllListItems().then(function(entities) {
         *     //Do something with all of the returned entities
         *     $scope.projects = entities;
         * };
         * </pre>
         */
        getAllListItems():ng.IPromise<ap.IndexedCache> {
            return this.apDataService.executeQuery(this, this.queries['getAllListItems']);
        }

        /**
         * @ngdoc function
         * @name Model.getCache
         * @description
         * Helper function that return the local cache for a named query if provided, otherwise
         * it returns the cache for the primary query for the model.  Useful if you know the query
         * has already been resolved and there's no need to check SharePoint for changes.
         *
         * @param {string} [queryName=defaultQueryName] A unique key to identify this query.
         * @returns {Array} Returns the contents of the current cache for a named query.
         *
         * @example
         * <pre>
         * var primaryQueryCache = projectModel.getCache();
         * </pre>
         *
         * <pre>
         * var primaryQueryCache = projectModel.getCache('primary');
         * </pre>
         *
         * <pre>
         * var namedQueryCache = projectModel.getCache('customQuery');
         * </pre>
         */
        getCache(queryName:string):ap.Cache {
            var model = this, query, cache;
            query = model.getQuery(queryName);
            if (query && query.indexedCache) {
                cache = query.indexedCache;
            }
            return cache;
        }

        /**
         * @ngdoc function
         * @name Model.getCachedEntity
         * @description
         * Attempts to locate a model entity by id.
         * @param {number} entityId The ID of the requested entity.
         * @returns {object} Returns either the requested entity or undefined if it's not found.
         */
        getCachedEntity(entityId:number):ap.ListItem {
            return this.apCacheService.getCachedEntity(this.list.getListId(), entityId);
        }

        /**
         * @ngdoc function
         * @name Model.getCachedEntities
         * @description
         * Returns all entities registered for this model regardless of query.
         * @returns {object[]} All registered entities for this model.
         */
        getCachedEntities():ap.IndexedCache {
            return this.apCacheService.getCachedEntities(this.list.getListId());
        }

        /**
         * @ngdoc function
         * @name Model.getFieldDefinition
         * @description
         * Returns the field definition from the definitions defined in the custom fields array within a model.
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
         * var locationDefinition = projectsModel.getFieldDefinition('location');
         * </pre>
         * @param {string} fieldName Internal field name.
         * @returns {object} Field definition.
         */
        getFieldDefinition(fieldName:string): ap.FieldDefinition {
            return <ap.FieldDefinition>_.findWhere(this.list.fields, {mappedName: fieldName});
        }

        /**
         * @ngdoc function
         * @name Model.getListItemById
         * @param {number} entityId Id of the item being requested.
         * @param {object} options Used to override apDataService defaults.
         * @description
         * Inherited from Model constructor
         * Attempts to retrieve the requested list item from the server.
         * @returns {object} Promise that resolves with the requested list item if found.  Otherwise it returns undefined.
         * @example
         * <pre>
         * //Taken from a fictitious projectsModel.js
         * projectModel.getListItemById(12).then(function(entity) {
         *     //Do something with the located entity
         *     $scope.project = entity;
         * };
         * </pre>
         */
        getListItemById(entityId:number, options?:Object):ng.IPromise<ap.ListItem> {
            var deferred = this.$q.defer(),
                model = this,
                /** Unique Query Name */
                queryKey = 'GetListItemById-' + entityId;

            /** Register a new Query if it doesn't already exist */
            if (!model.getQuery(queryKey)) {
                var defaults = {
                    name: queryKey,
                    operation: 'GetListItems',
                    CAMLRowLimit: 1,
                    CAMLQuery: '' +
                    '<Query>' +
                    ' <Where>' +
                    '   <Eq>' +
                    '     <FieldRef Name="ID"/>' +
                    '     <Value Type="Number">' + entityId + '</Value>' +
                    '   </Eq>' +
                    ' </Where>' +
                    '</Query>'
                };
                /** Allows us to override defaults */
                var opts = _.extend({}, defaults, options);
                model.registerQuery(opts);
            }

            model.executeQuery(queryKey)
                .then((indexedCache) => {
                    /** Should return an indexed cache object with a single entity so just return the requested entity */
                    deferred.resolve(indexedCache.first());
                }, (err) => {
                    deferred.reject(err);
                });

            return deferred.promise;
        }

        /**
         * @ngdoc function
         * @name Model.getQuery
         * @description
         * Helper function that attempts to locate and return a reference to the requested or catchall query.
         * @param {string} [queryName=defaultQueryName] A unique key to identify this query.
         * @returns {object} See Query prototype for additional details on what a Query looks like.
         *
         * @example
         * <pre>
         * var primaryQuery = projectModel.getQuery();
         * </pre>
         *
         * <pre>
         * var primaryQuery = projectModel.getQuery('primary');
         * </pre>
         *
         * <pre>
         * var namedQuery = projectModel.getQuery('customQuery');
         * </pre>
         */
        getQuery(queryName:string):ap.Query {
            var model = this, query;
            var defaultQueryName = this.apConfig.defaultQueryName;
            if (_.isObject(model.queries[queryName])) {
                /** The named query exists */
                query = model.queries[queryName];
            } else if (_.isObject(model.queries[defaultQueryName]) && !queryName) {
                /** A named query wasn't specified and the catchall query exists */
                query = model.queries[defaultQueryName];
            } else {
                /** Requested query not found */
                query = undefined;
            }
            return query;
        }


        /**
         * @ngdoc function
         * @name Model.isInitialised
         * @description
         * Methods which allows us to easily determine if we've successfully made any queries this session.
         * @returns {boolean} Returns evaluation.
         */
        isInitialised():boolean {
            return _.isDate(this.lastServerUpdate);
        }

        /**
         * @ngdoc function
         * @name Model.resolvePermissions
         * @description
         * See apModelFactory.resolvePermissions for details on what we expect to have returned.
         * @returns {Object} Contains properties for each permission level evaluated for current user.
         * @example
         * Lets assume we're checking to see if a user has edit rights for a given list.
         * <pre>
         * var userPermissions = tasksModel.resolvePermissions();
         * var userCanEdit = userPermissions.EditListItems;
         * </pre>
         * Example of what the returned object would look like
         * for a site admin.
         * <pre>
         * perm = {
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
            var model = this;
            if (model.list && model.list.effectivePermMask) {
                /** Get the permission mask from the permission mask name */
                var permissionMask = this.apUtilityService.convertEffectivePermMask(model.list.effectivePermMask);
                return this.apUtilityService.resolvePermissions(permissionMask);
            } else {
                window.console.error('Attempted to resolve permissions of a model that hasn\'t been initialized.', model);
                return this.apUtilityService.resolvePermissions(null);
            }
        }

        /**
         * @ngdoc function
         * @name Model.registerQuery
         * @description
         * Constructor that allows us create a static query with the option to build dynamic queries as seen in the
         * third example.  This construct is a passthrough to [SPServices](http://spservices.codeplex.com/)
         * @param {object} [queryOptions] Optional options to pass through to the
         * [dataService](#/api/dataService.executeQuery).
         * @param {string} [queryOptions.name=defaultQueryName] Optional name of the new query (recommended but will
         * default to 'Primary' if not specified)
         * @param {string} [queryOptions.operation="GetListItemChangesSinceToken"] Defaults to
         * [GetListItemChangesSinceToken](http://msdn.microsoft.com/en-us/library/lists.lists.getlistitemchangessincetoken%28v=office.12%29.aspx)
         * but for a smaller payload and faster response you can use
         * [GetListItems](http://spservices.codeplex.com/wikipage?title=GetListItems&referringTitle=Lists).
         * @param {boolean} [queryOptions.cacheXML=false] Typically don't need to store the XML response because it
         * has already been parsed into JS objects.
         * @param {string} [queryOptions.offlineXML] Optionally reference a specific XML file to use for this query instead
         * of using the shared XML file used by all queries on this model.  Useful to mock custom query results.
         * @param {string} [queryOptions.query] CAML Query - Josh McCarty has a good quick reference
         * [here](http://joshmccarty.com/2012/06/a-caml-query-quick-reference)
         * @param {string} [queryOptions.queryOptions]
         * <pre>
         * // Default options
         * '<QueryOptions>' +
         * '   <IncludeMandatoryColumns>' +
         *      'FALSE' +
         *     '</IncludeMandatoryColumns>' +
         * '   <IncludeAttachmentUrls>' +
         *      'TRUE' +
         *     '</IncludeAttachmentUrls>' +
         * '   <IncludeAttachmentVersion>' +
         *      'FALSE' +
         *     '</IncludeAttachmentVersion>' +
         * '   <ExpandUserField>' +
         *      'FALSE' +
         *     '</ExpandUserField>' +
         * '</QueryOptions>',
         * </pre>
         *
         *
         * @returns {object} Query Returns a new query object.
         *
         * @example
         * <h4>Example #1</h4>
         * <pre>
         * // Query to retrieve the most recent 25 modifications
         * model.registerQuery({
     *    name: 'recentChanges',
     *    CAMLRowLimit: 25,
     *    query: '' +
     *        '<Query>' +
     *        '   <OrderBy>' +
     *        '       <FieldRef Name="Modified" Ascending="FALSE"/>' +
     *        '   </OrderBy>' +
     *            //Prevents any records from being returned if user doesn't
     *            // have permissions on project
     *        '   <Where>' +
     *        '       <IsNotNull>' +
     *        '           <FieldRef Name="Project"/>' +
     *        '       </IsNotNull>' +
     *        '   </Where>' +
     *        '</Query>'
     * });
         * </pre>
         *
         * <h4>Example #2</h4>
         * <pre>
         * // Could be placed on the projectModel and creates the query but doesn't
         * // call it
         * projectModel.registerQuery({
     *     name: 'primary',
     *     query: '' +
     *         '<Query>' +
     *         '   <OrderBy>' +
     *         '       <FieldRef Name="Title" Ascending="TRUE"/>' +
     *         '   </OrderBy>' +
     *         '</Query>'
     * });
         *
         * //To call the query or check for changes since the last call
         * projectModel.executeQuery('primary').then(function(entities) {
     *     // We now have a reference to array of entities stored in the local
     *     // cache.  These inherit from the ListItem prototype as well as the
     *     // Project prototype on the model
     *     $scope.projects = entities;
     * });
         * </pre>
         *

         * <h4>Example #3</h4>
         * <pre>
         * // Advanced functionality that would allow us to dynamically create
         * // queries for list items with a lookup field associated with a specific
         * // project id.  Let's assume this is on the projectTasksModel.
         * model.queryByProjectId(projectId) {
     *     // Unique query name
     *     var queryKey = 'pid' + projectId;
     *
     *     // Register project query if it doesn't exist
     *     if (!_.isObject(model.queries[queryKey])) {
     *         model.registerQuery({
     *             name: queryKey,
     *             query: '' +
     *                 '<Query>' +
     *                 '   <OrderBy>' +
     *                 '       <FieldRef Name="ID" Ascending="TRUE"/>' +
     *                 '   </OrderBy>' +
     *                 '   <Where>' +
     *                 '       <And>' +
     *                              // Prevents any records from being returned
     *                              //if user doesn't have permissions on project
     *                 '           <IsNotNull>' +
     *                 '               <FieldRef Name="Project"/>' +
     *                 '           </IsNotNull>' +
     *                              // Return all records for the project matching
     *                              // param projectId
     *                 '           <Eq>' +
     *                 '               <FieldRef Name="Project" LookupId="TRUE"/>' +
     *                 '               <Value Type="Lookup">' + projectId + '</Value>' +
     *                 '           </Eq>' +
     *                 '       </And>' +
     *                 '   </Where>' +
     *                 '</Query>'
     *         });
     *     }
     *     //Still using execute query but now we have a custom query
     *     return model.executeQuery(queryKey);
     * };
         pre>
         */
        registerQuery(queryOptions:ap.QueryOptions):ap.Query {
            var model = this;

            var defaults = {
                /** If name isn't set, assume this is the only model and designate as primary */
                name: this.apConfig.defaultQueryName
            };

            queryOptions = _.extend({}, defaults, queryOptions);

            model.queries[queryOptions.name] = this.apQueryFactory.create(queryOptions, model);

            /** Return the newly created query */
            return model.queries[queryOptions.name];
        }

        /**
         * @ngdoc function
         * @name Model.searchLocalCache
         * @module Model
         * @description
         * Search functionality that allow for deeply searching an array of objects for the first
         * record matching the supplied value.  Additionally it maps indexes to speed up future calls.  It
         * currently rebuilds the mapping when the length of items in the local cache has changed or when the
         * rebuildIndex flag is set.
         *
         * @param {*} value The value or array of values to compare against.
         * @param {object} [options] Object containing optional parameters.
         * @param {string} [options.propertyPath] The dot separated propertyPath.
         * <pre>
         * 'project.lookupId'
         * </pre>
         * @param {object} [options.cacheName] Required if using a data source other than primary cache.
         * @param {object} [options.localCache=model.getCache()] Array of objects to search (Default model.getCache()).
         * @param {boolean} [options.rebuildIndex=false] Ignore previous index and rebuild.
         *
         * @returns {(object|object[])} Either the object(s) that you're searching for or undefined if not found.
         */
        searchLocalCache(value:any|any[], options:{cacheName?:string; localCache:ap.Cache; propertyPath:string;rebuildIndex:boolean}):ap.ListItem|ap.ListItem[] {
            var model = this,
                searchCache,
                searchIndex,
                searchResults,
                defaults = {
                    propertyPath: 'id',
                    localCache: model.getCache(),
                    cacheName: 'main',
                    rebuildIndex: false
                };
            /** Extend defaults with any provided options */
            var opts:{cacheName?:string; localCache:ap.Cache; propertyPath:string;rebuildIndex:boolean}
                = _.extend({}, defaults, options);

            if (opts.propertyPath === 'id') {
                searchIndex = opts.localCache;
            } else {
                /** Create a cache if it doesn't already exist */
                model._cachedIndexes = model._cachedIndexes || {};
                model._cachedIndexes[opts.cacheName] = model._cachedIndexes[opts.cacheName] || {};
                searchCache = model._cachedIndexes[opts.cacheName];
                var properties = opts.propertyPath.split('.');
                /** Create cache location with the same property map as the one provided
                 * @example
                 * <pre>
                 * model._cachedIndexes{
                 *      main: { //Default Cache name unless otherwise specified
                 *          lookup: {
                 *              lookupId: { ///// Cache Location for 'lookup.lookupId' //////// }
                 *          },
                 *          user: {
                 *              lookupValue: { ///// Cache Location for 'user.lookupValue' //////// }
                 *          }
                 *      }
                 * }
                 * </pre>
                 */
                _.each(properties, (attribute) => {
                    searchCache[attribute] = searchCache[attribute] || {};
                    /** Update cache reference to another level down the cache object */
                    searchCache = searchCache[attribute];
                });

                /** Remap if no existing map, the number of items in the array has changed, or the rebuild flag is set */
                if (!_.isNumber(searchCache.count) || searchCache.count !== opts.localCache.count() || opts.rebuildIndex) {
                    searchCache.indexedCache = deepGroup(opts.localCache, opts.propertyPath);
                    /** Store the current length of the array for future comparisons */
                    searchCache.count = opts.localCache.count();
                    /** Simple counter to gauge the frequency we rebuild cache */
                    searchCache.buildCount = searchCache.buildCount || 0;
                    searchCache.buildCount++;
                }
                searchIndex = searchCache.indexedCache;
            }

            /** Allow an array of values to be passed in */
            if (_.isArray(value)) {
                searchResults = [];
                _.each(value, (key) => {
                    searchResults.push(searchIndex[key]);
                });
                /** Primitive passed in */
            } else {
                searchResults = searchIndex[value];
            }
            return searchResults;
        }


        /**
         * @ngdoc function
         * @name Model.validateEntity
         * @description
         * Uses the custom fields defined in an model to ensure each field (required = true) is evaluated
         * based on field type
         *
         * @param {object} entity SharePoint list item.
         * @param {object} [options] Object containing optional parameters.
         * @param {boolean} [options.toast=true] Should toasts be generated to alert the user of issues.
         * @returns {boolean} Evaluation of validity.
         */
        validateEntity(entity:ap.ListItem, options?:{toast?:boolean}):boolean {
            var valid = true,
                model = this;

            var defaults = {
                toast: true
            };

            /** Extend defaults with any provided options */
            var opts = _.extend({}, defaults, options);

            var checkObject = (fieldValue) => _.isObject(fieldValue) && _.isNumber(fieldValue.lookupId);

            _.each(model.list.customFields, (fieldDefinition:ap.FieldDefinition) => {
                var fieldValue = entity[fieldDefinition.mappedName];
                var fieldDescriptor = '"' + fieldDefinition.objectType + '" value.';
                /** Only evaluate required fields */
                if ((fieldDefinition.required || fieldDefinition.Required) && valid) {
                    switch (fieldDefinition.objectType) {
                        case 'Boolean':
                            valid = _.isBoolean(fieldValue);
                            break;
                        case 'DateTime':
                            valid = _.isDate(fieldValue);
                            break;
                        case 'Lookup':
                        case 'User':
                            valid = checkObject(fieldValue);
                            break;
                        case 'LookupMulti':
                        case 'UserMulti':
                            /** Ensure it's a valid array containing objects */
                            valid = _.isArray(fieldValue) && fieldValue.length > 0;
                            if (valid) {
                                /** Additionally check that each lookup/person contains a lookupId */
                                _.each(fieldValue, (fieldObject) => {
                                    if (valid) {
                                        valid = checkObject(fieldObject);
                                    } else {
                                        /** Short circuit */
                                        return false;
                                    }
                                });
                            }
                            break;
                        default:
                            /** Evaluate everything else as a string */
                            valid = !_.isEmpty(fieldValue);

                    }
                    if (!valid && opts.toast) {
                        var fieldName = fieldDefinition.label || fieldDefinition.staticName;
                        this.toastr.error(fieldName + ' does not appear to be a valid ' + fieldDescriptor);
                    }
                }
                if (!valid) {
                    return false;
                }
            });
            return valid;
        }

    }

    angular
        .module('pmam-deliverables')
        .service('apModel', Model);

}
