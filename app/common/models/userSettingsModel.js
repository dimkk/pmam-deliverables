(function () {
    'use strict';

    angular
        .module('pmam-deliverables')
        .factory('userSettingsModel', userSettingsModel);

    function userSettingsModel(_, apModelFactory, $modal) {

        /** Object Constructor (class)*/
        function UserSettings(obj) {
            var self = this;
            var defaults = {
                preferences: {
                    teamMembers: [],
                    pageStates: {}
                }
            };
            return _.extend(self, defaults, obj);
        }

        /** Model Constructor */
        /** Adds "addNewItem" and "getAllListItems" to the model and ensures "data", "queries", and "ready" have been added */
        /** Also passes list to List constructor to build viewFields (XML definition of fields to return) */
        var model = apModelFactory.create({
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

        /* A user should have a single preferences list item with the title='1App'*/
        model.registerQuery({
            name: 'primary',
            operation: 'GetListItems',
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
            '               <Value Type="Text">1App</Value>' +
            '           </Eq>' +
            '       </And>' +
            '   </Where>' +
            '</Query>'
        });

        model.executeQuery()
            .then(function (entities) {
                /** Create new record if it doesn't already exist */
                if (!entities.count()) {
                    //Newly created list item is processed and added to model.data
                    model.addNewItem({title: '1App', preferences: {}})
                        .then(function () {
                            //Identify current user

                        });
                }
            });

        /********************* Model Specific Shared Functions ***************************************/
            //Allows storage and retrieval of page states between sessions
        model.pageState = function (pageName, pageState) {

            //Getter
            if (!pageState) {
                return model.getCache().first().preferences.pageStates[pageName];
            }

            //Setter
            model.getCache().first().preferences.pageStates[pageName] = pageState;
            model.getCache().first().saveChanges();
        };

        model.addMember = function (user) {
            console.log(user);
            if (!model.getCache().first().preferences.teamMembers) {
                model.getCache().first().preferences.teamMembers = [];
            }

            //Check to make sure team member isn't already saved
            if (model.getCache().first().preferences.teamMembers.indexOf(user.accountName.lookupId) === -1) {
                model.getCache().first().preferences.teamMembers.push(user.accountName.lookupId);
            }
            return model.getCache().first().saveChanges();
        };

        model.deleteMember = function (user) {
            var index = model.getCache().first().preferences.teamMembers.indexOf(user.accountName.lookupId);
            model.getCache().first().preferences.teamMembers.splice(index, 1);
            return model.getCache().first().saveChanges();
        };

        model.isMember = function (user) {
            return _.contains(model.getCache().first().preferences.teamMembers, user.accountName.lookupId);
        };

        model.openModal = function () {

            var modalInstance = $modal.open({
                templateUrl: 'modules/favorites/views/favorites_view.html',
                controller: 'favoritesCtrl'
            });
            return modalInstance.result;
        };

        return model;
    }
})();

