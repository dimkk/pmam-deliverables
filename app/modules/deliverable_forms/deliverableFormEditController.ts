/// <reference path="../../../typings/app.d.ts" />
module app {
    'use strict';

    interface IStateParams extends angular.ui.IStateParamsService{
        activeTab?:string;
    }

    var vm:DeliverableFormEditController;


    class DeliverableFormEditController{
        activeTab:string;
        dataReady = false;
        isReadonly = false;
        max = 5;
        negotiatingWithServer = false;
        rate = 5;
        personnelArray:ap.IUser[];
        userDeliverableFeedback:DeliverableFeedback;
        deliverableTypes:DeliverableDefinition[];
        deliverableFeedback:DeliverableFeedback[];
        percent:number;
        userCanContribute:boolean;
        deliverableBackup:Deliverable;
        getLabelClass(rating:number):string;
        monthOptions:{number:number; label:string}[];

        constructor(private deliverableFeedbackModel:DeliverableFeedbackModel, private toastr,
                    private $state:angular.ui.IStateService, private userService, private $q,
                    private $stateParams:IStateParams,
                    private deliverableDefinitionsModel:DeliverableDefinitionsModel,
                    private deliverableRecord:Deliverable, private ratingsService:RatingsService,
                    private calendarService:CalendarService, private $scope:ng.IScope, private selectedTask) {

            //TODO Need to add logic to revert back to pristine deliverable in cache if entity is updated and user leaves
            // without saving
            vm = this;
            /** Store the record in pristine state so we can revert back if cancelled */
            vm.deliverableBackup = angular.copy(deliverableRecord);
            /** Allows us to navigate directly to discussion tab */
            vm.activeTab = $stateParams.activeTab ? $stateParams.activeTab : 'main'; //2 tabs are ['main', 'discussion']
            vm.getLabelClass = ratingsService.getLabelClass;
            vm.monthOptions = calendarService.getMonthOptions();
            vm.userCanContribute = userService.userCanContribute;

            // rating settings

            vm.activate();


        }
        activate() {
            if (!vm.deliverableRecord) {
                /** Redirect if a valid deliverable isn't found */
                vm.toastr.error('The requested deliverable wasn\'t found.');
                return vm.$state.go('deliverables.monthly');
            }

            vm.$q.all([
                vm.userService.getUserLookupValues(),
                vm.deliverableFeedbackModel.getFyFeedback(vm.deliverableRecord.fy),
                vm.deliverableDefinitionsModel.getFyDefinitions(vm.deliverableRecord.fy)
            ]).then( (resolvedPromises) => {
                vm.personnelArray = resolvedPromises[0];
                vm.deliverableTypes = resolvedPromises[2];

                // get all feedback for this deliverable
                vm.deliverableFeedback = vm.deliverableRecord.getCachedFeedbackByDeliverableId();
                

                // get feedback for just the current user for this deliverable
                vm.userDeliverableFeedback = vm.deliverableRecord.getCachedFeedbackForCurrentUser();

                //TODO Clean this up, currently it's here just to initialize the percent label if the user has feedback
                if (vm.userDeliverableFeedback) {
                    vm.percent = 100 * (vm.userDeliverableFeedback.rating / vm.max);
                }

                vm.dataReady = true;
            });

            /** Create a log record so we can collect metrics on the average duration a user is on this page */
            vm.deliverableRecord.registerDeliverableAccessEvent()
                .then( (deliverableAccessEvent) => {
                    /** Wait for user to leave current state so we can log it */
                    vm.$scope.$on('$stateChangeStart', function () {
                        /** Causes modified date to reflect updated time so we can get delta between created and modified */
                        deliverableAccessEvent.saveChanges();
                    });
                });
        }
        cancel() {
            /** Revert any changes made back to the original data */
            _.extend(vm.deliverableRecord, vm.deliverableBackup);
            vm.navigateBack();
        }

        deleteMyFeedback(feedback:DeliverableFeedback) {
            //TODO This currently doesn't fully purge the cache and needs to be addressed
            var confirmation = window.confirm('Are you sure you want to delete your feedback?');
            if (confirmation) {
                feedback.deleteItem()
                    .then(function () {
                        /** Record is deleted from server and local cache so instantiate a new feedback record */
                        vm.userDeliverableFeedback = vm.deliverableRecord.getCachedFeedbackForCurrentUser();
                        vm.toastr.success('Feedback successfully removed.')
                    })
            }
        }

        deleteRecord() {
            var confirmation = window.confirm('Are you sure you want to delete this deliverable?');
            if (confirmation) {
                vm.negotiatingWithServer = true;
                vm.deliverableRecord.deleteItem().then(function () {
                    vm.toastr.success("Deliverable successfully deleted");
                    vm.navigateBack();
                }, function () {
                    vm.toastr.error("There was a problem deleting this deliverable record");
                });
            }
        }

        discussionBadgeValue() {
            /** Display the number of posts if greater than 0 */
            return vm.deliverableRecord.discussionThread.posts && vm.deliverableRecord.discussionThread.posts.length > 0 ?
                vm.deliverableRecord.discussionThread.posts.length : '';
        }

        getFeedbackArray() {
            return _.toArray(vm.deliverableRecord.getCachedFeedbackByDeliverableId());
        }

        provideFeedback(isAcceptable:boolean) {
            var previousAcceptability = vm.userDeliverableFeedback.acceptable;
            vm.deliverableRecord.openFeedbackModal({acceptable: isAcceptable}, vm.userDeliverableFeedback)
                .then(function (updatedFeedback) {
                    //No action necessary because user saved
                    vm.userDeliverableFeedback = updatedFeedback;
                }, function (err) {
                    //Revert back to previous state of feedback because user cancelled
                    vm.userDeliverableFeedback.acceptable = previousAcceptability;
                });
        }

        save() {
            vm.negotiatingWithServer = true;
            var saveRecord = vm.deliverableRecord.saveChanges();

            saveRecord.then(function () {
                vm.toastr.success("Deliverable updated");
                vm.navigateBack();
            }, function () {
                vm.toastr.error("There was a problem updating this deliverable record");
            });

            return saveRecord;
        }

        submit() {
            if(!vm.deliverableRecord.to || vm.deliverableRecord.to.length === 0) {
                return vm.toastr.error('At least "To" recipient is required before a notification can be generated.');
            }
            vm.negotiatingWithServer = true;
            vm.deliverableRecord.generateNewDeliverableNotification()
                .then(vm.navigateBack);
        }

        updateFeedback() {
            vm.userDeliverableFeedback.saveChanges()
                .then( (updatedFeedback:DeliverableFeedback) => {
                    vm.toastr.success("Feedback updated");
                    /** Ensure feedback reference is updated */
                    vm.userDeliverableFeedback = updatedFeedback;
                });
        }

        navigateBack() {
            console.log(vm.deliverableRecord.deliverableType);
            vm.$state.go('deliverables.monthly', {
                mo: vm.deliverableRecord.fiscalMonth,
                fy: vm.deliverableRecord.fy
                
            });

        }
    }

    angular
        .module('pmam-deliverables')
        .controller('deliverableFormEditController', DeliverableFormEditController);

}
