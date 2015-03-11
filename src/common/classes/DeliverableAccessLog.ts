/// <reference path="../../../typings/tsd.d.ts" />

module app.models {
    'use strict';

    export interface IDeliverableAccessLog extends ap.ListItem {
        deliverable?:ap.Lookup;
        fy?:number;
        _deleteItem?():ng.IPromise<any>;
        getReviewDuration():number;
        getHumanizedReviewDuration():string;
    }

    var model;

    export class DeliverableAccessLog implements IDeliverableAccessLog {
        modified:Date;
        created:Date;
        constructor(obj) {
            _.extend(this, obj);
            model = model || this.getModel();

            /** Store in cached object so we can reference by requirement id when filtering */
            model.registerLogByDeliverable(this);

            /** Modify standard prototype delete logic so we can remove from cache prior to actually deleting */
            this._deleteItem = this.deleteItem;

            this.deleteItem = function():ng.IPromise<any> {
                model.removeLogByDeliverable(self);
                return this._deleteItem();
            }
        }


        /**
         * @name DeliverableAccessLog.getReviewDuration
         * @description A record is created when a user accesses a deliverable details form.  It is then updated when the
         * user leaves the form so this method returns the number of milliseconds between the created and modified
         * dates.
         * @returns {Number} Number of milliseconds between log created and modified dates.
         */
        getReviewDuration():number {
            /** Get the number of milliseconds between modified and created */
            return moment(this.modified).diff(this.created);
        }


        /**
         * @name DeliverableAccessLog.getHumanizedReviewDuration
         * @returns {String} Humanized version of duration (eg. 'a few seconds')
         */
        getHumanizedReviewDuration():string {
            /** Return the duration as a humanized string (eg 'a few seconds') */
            return moment.duration(this.getReviewDuration()).humanize();
        }

    }

}
