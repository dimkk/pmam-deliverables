/// <reference path="../../../typings/app.d.ts" />
module app {
    'use strict';

    class FeedbackModalController{
        deliverable:Deliverable;
        fullControl:boolean = false;
        negotiatingWithServer = false;
        userCanDelete:boolean = false;
        userCanEdit:boolean = false;
        constructor(private userFeedback: DeliverableFeedback, private isAuthor: boolean,
                    private $modalInstance: angular.ui.bootstrap.IModalServiceInstance,
                    private userService: UserService,
                    private toastr, private deliverablesModel: DeliverablesModel) {

            this.fullControl = userService.userIsAdmin();
            /** Admins and user who created feedback can edit and delete */
            this.userCanEdit = this.fullControl || this.isAuthor;
            this.userCanDelete = this.userFeedback.id && this.userCanEdit;
            this.deliverable = deliverablesModel.getCachedEntity<Deliverable>(this.userFeedback.deliverable.lookupId);
        }
        cancel() {
            this.$modalInstance.dismiss('cancel');
        }
        deleteFeedback() {
            this.userFeedback.deleteItem()
                .then( () => this.$modalInstance.close() );
        }
        save() {
            if(this.validate()) {
                this.negotiatingWithServer = true;
                this.userFeedback.saveChanges()
                    .then( (updatedFeedback) => this.$modalInstance.close(updatedFeedback) );
            }
        }
        validate():boolean {
            var isValid = true;
            if(this.userFeedback.acceptable === null) {
                this.toastr.warning('Please provide an acceptability rating for this deliverable.');
                isValid = false;
            } else if(!this.userFeedback.acceptable && this.userFeedback.comments.length === 0) {
                this.toastr.warning('Please provide comments as to why this deliverable is unacceptable.');
                isValid = false;
            }
            return isValid;
        }
    }

    angular
        .module('pmam-deliverables')
        .controller('feedbackModalController', FeedbackModalController);


}
