/// <reference path="../../../typings/tsd.d.ts" />
/// <reference path="./deliverableFeedbackModel.ts" />

module app.models{
    export interface IDeliverableFeedback extends ap.ListItem {
        title?:string;
        comments?:string;
        fy?:number;
        acceptable?:boolean;
        definition?:ap.Lookup;
        deliverable?:ap.Lookup;
        rating?:number;
    }

    var model = <IDeliverableFeedbackModel>app.models.DeliverableFeedbackModel;

    export class DeliverableFeedback implements IDeliverableFeedback{

        constructor(obj) {
            var self = this;
            _.extend(self, obj);
            /** Store in cached object so we can reference by requirement id when filtering */
            model.registerFeedbackByDeliverable(self);
            /** Modify standard prototype delete logic so we can remove from cache prior to actually deleting */
            self._deleteItem = self.deleteItem;
            self.deleteItem = function() {
                model.removeFeedbackByDeliverable(self);
                return self._deleteItem();
            }
        }
    }

}
