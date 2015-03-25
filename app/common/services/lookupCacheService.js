(function () {
    'use strict';

    angular
        .module('pmam-deliverables')
        .service('lookupCacheService', lookupCacheService);

    /**
     * @ngdoc service
     * @name lookupCacheService
     * @description
     *
     */
    function lookupCacheService(_, apIndexedCacheFactory) {

        this.cacheEntityByLookupId = cacheEntityByLookupId;
        this.removeEntityFromLookupCaches = removeEntityFromLookupCaches;
        this.retrieveLookupCacheById = retrieveLookupCacheById;

        var lookupCache = {};

        /**
         * @ngdoc function
         * @name lookupCacheService:cacheEntityByLookupId
         * @methodOf RTM.lookupCacheService
         * @param {ListItem} entity List item to index.
         * @param {string[]} propertyArray Array of the lookup properties to index by lookupId.
         */
        function cacheEntityByLookupId(entity, propertyArray) {
            if(entity.id) {
                /** GUID of the list definition on the model */
                var listId = entity.getListId();
                /** Only cache entities saved to server */
                _.each(propertyArray, function(propertyName) {
                    cacheSingleLookup(entity, propertyName, listId);
                });
            }
        }

        function cacheSingleLookup(entity, propertyName, listId) {
            /** Handle single and multiple lookups by only dealing with an Lookup[] */
            var lookups = _.isArray(entity[propertyName]) ? entity[propertyName] : [entity[propertyName]];
            _.each(lookups, function(lookup) {
                if(lookup && lookup.lookupId) {
                    var lookupCache = getLookupCache(propertyName, listId);
                    lookupCache[lookup.lookupId] = lookupCache[lookup.lookupId] || apIndexedCacheFactory.create();
                    lookupCache[lookup.lookupId].addEntity(entity);
                }
            });
        }


        function removeEntityFromLookupCaches(entity, propertyArray) {
            if(entity.id) {
                var listId = entity.getListId();
                /** Only cache entities saved to server */
                _.each(propertyArray, function(propertyName) {
                    removeEntityFromSingleLookupCache(entity, propertyName, listId);
                });
            }
        }

        function removeEntityFromSingleLookupCache(entity, propertyName, listId) {
            /** Handle single and multiple lookups by only dealing with an Lookup[] */
            var lookups = _.isArray(entity[propertyName]) ? entity[propertyName] : [entity[propertyName]];
            _.each(lookups, function(lookup) {
                if(lookup && lookup.lookupId) {
                    var lookupCache = getLookupCache(propertyName, listId);
                    if(lookupCache[lookup.lookupId]) {
                        lookupCache[lookup.lookupId].removeEntity(entity);
                    }
                }
            });
        }

        /**
         * @ngdoc function
         * @name lookupCacheService:retrieveLookupCacheById
         * @methodOf lookupCacheService
         * @param {string} propertyName Cache name - name of property on cached entity.
         * @param {number} cacheId ID of the cache.  The entity.property.lookupId.
         * @param {string} listId GUID of the list definition on the model.
         * @param {boolean} [asObject=false] Defaults to return as an array but if set to false returns the cache object
         * instead.
         * @returns {object} Keys of entity id and value of entity.
         */
        function retrieveLookupCacheById(propertyName, listId, cacheId, asObject) {
            var cache = getLookupCache(propertyName, listId);
            if(asObject) {
                return cache[cacheId] ? cache[cacheId] : {};
            } else {
                return cache[cacheId] ? _.toArray(cache[cacheId]) : [];
            }
        }

        function getLookupCache(propertyName, listId) {
            lookupCache[listId] = lookupCache[listId] || {};
            lookupCache[listId][propertyName] = lookupCache[listId][propertyName] || {};
            return lookupCache[listId][propertyName];
        }

    }
})();
