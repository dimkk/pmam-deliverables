/// <reference path="../../../typings/app.d.ts" />
module app {
    'use strict';

    var model:UserSettingsModel, deferred;

    export class UserSettings extends ap.ListItem {
        preferences = {teamMembers: [], pageStates: {}};
        constructor(obj) {
            super();
            _.assign(this, obj);
        }
    }

    export class UserSettingsModel extends ap.Model {
        ready:ng.IPromise<UserSettings>;
        constructor($q, private user:IUser, ListItemFactory, ModelFactory) {
            model = this;
            /** Model Constructor */
            /** Adds "addNewItem" and "getAllListItems" to the model and ensures "data", "queries", and "ready" have been added */
            /** Also passes list to List constructor to build viewFields (XML definition of fields to return) */
            super({
                factory: UserSettings,
                list: {
                    title: 'UserSettings',
                    /**Maps to the offline XML file in dev folder (no spaces) */
                    guid: '{BFF21E9D-7BCC-47F1-A583-09A3CDF68D8F}',
                    /**List GUID can be found in list properties in SharePoint designer */
                    customFields: [
                    /** Array of objects mapping each SharePoint field to a property on a list item object */
                    /** If pmam-fmt live templates have been imported type "oafield" folled by the tab key for
                     /*  each field to quickly map with available options */
                        {staticName: 'Title', objectType: 'Text', mappedName: 'title', readOnly: false},
                        {staticName: 'Preferences', objectType: 'JSON', mappedName: 'preferences', readOnly: false}
                    ]
                }
            });

            deferred = $q.defer();
            model.ready = deferred.promise;


            /* A user should have a single preferences list item with the title='1App'*/
            model.registerQuery({
                name: 'primary',
                operation: 'GetListItems',
                CAMLRowLimit: 1,
                query: '' +
                '<Query>' +
                '   <Where>' +
                '       <And>' +
                '           <Eq>' +
                '               <FieldRef Name="Author" LookupId="TRUE" />' +
                '               <Value Type="Integer"><UserID /></Value>' +
                '           </Eq>' +
                '           <Eq>' +
                '               <FieldRef Name="Title"/>' +
                '               <Value Type="Text">ESED Deliverables</Value>' +
                '           </Eq>' +
                '       </And>' +
                '   </Where>' +
                '</Query>'
            });

        }

        identifyCurrentUser() {
            return model.executeQuery('primary')
                .then(function (indexedCache) {
                    //Create new record if it doesn't already exist
                    if (indexedCache.count() === 0) {
                        //Newly created list item is processed and added to model.data
                        model.addNewItem({title: 'ESED Deliverables', preferences: {}})
                            .then(function (newItemCache:UserSettings) {
                                /** Returns the newly created list item */
                                model.updateReference(newItemCache);
                            });
                    } else {
                        model.updateReference(indexedCache.first());
                    }
                });
        }

        /** Creates a reference to the current user on the model */
        updateReference(userSettings) {
            //Resolve this model
            deferred.resolve(userSettings);
            _.extend(model.user, userSettings.author);
        }

    }

    angular
        .module('pmam-deliverables')
        .service('userSettingsModel', UserSettingsModel);

}

