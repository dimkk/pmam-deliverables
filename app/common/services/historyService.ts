/** Allows us to navigate back or to a default view.  Solution expanded from example found @ https://github.com/angular-ui/ui-router/issues/92 */
//TODO Look at making more generic so we can use service in other projects

module app {

    export class HistoryService {
        private history = [];
        private defaultState: string;
        private defaultParams: Object;

        constructor(private $state) {

        }

        all() {
            return this.history;
        }

        back() {
            return this.go(-1);
        }

        go(step = -1) {

            if(this.history.length < 2) {

                /** Go to default state if this is first active state */
                return this.$state.go(this.defaultState, this.defaultParams);

            } else {

                var prev = this.previous(step);
                return this.$state.go(prev.state, prev.params);

            }
        }

        private previous(step) {
            return this.history[this.history.length - Math.abs(step || 1)];
        }

        private push(state, params) {
            this.history.push({state: state, params: params});
        }

        registerDefault(state: string, params?: Object) {
            this.defaultState = state;
            this.defaultParams = params;
        }

    }

    function Register(historyService, $state, $rootScope) {

        /** Register all changes */
        $rootScope.$on("$stateChangeSuccess", function (event, to, toParams, from, fromParams) {
            if (!from.abstract) {
                historyService.push(from, fromParams);
            }
        });

        /** Set the default route if the user is still on the first page */
        historyService.registerDefault('deliverables.monthly');

        /** Register initial route */
        historyService.push($state.current, $state.params);

    }

    angular
        .module('pmam-deliverables')
        .service("historyService", HistoryService)
        .run(Register);

}
