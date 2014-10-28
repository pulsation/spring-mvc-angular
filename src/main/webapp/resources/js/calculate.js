angular.module('calculate', ['ui.bootstrap', 'ngSanitize', 'ngResource', 'rx', 'ngAnimate', 'ui.grid'])

/**
 * REST resource for operation results
 */

.factory('OperationResult', ['$resource', function ($resource) {
    return $resource('/data/calculate-results/');
}])

.service('observableChains', function ($http, OperationResult) {

    // Load template partial
    var httpSquarePartial = function (x) {
        return $http({
            method: 'POST',
            url: '/partials/square',
            data: { "x": x }
        });
    };

    return {

        /**
         * Throttles and returns an http request promise loading
         * the template partial
         */
        updatePartialObservableFrom: function (originalObservable) {

            return originalObservable

            // Throttle stream in order to avoid too much ajax requests
            .throttle(300)

            // Take async requests in the right order
            .flatMapLatest(function(operand) {
                return (httpSquarePartial(operand.newValue));
            });
        },

        /**
         * Returns an http request promise saving an OperationResult resource
         */
        saveResultObservableFrom: function (originalObservable) {

            return originalObservable

            // Map operand to something readable
            .map(function (operand) {
                var result = new OperationResult();

                result.operation = operand + "^2";
                result.value = operand * operand;
                return result;
            })

            .flatMap(function (operationResult) {
                return operationResult.$save();
            });
        },

        /**
         * Returns an http request that loads history
         */
        loadHistoryObservableFrom: function (originalObservable) {

            return originalObservable

            // Load history as soon as the application is launched
            .startWith(null)

            .flatMap(function () {
                var resultHistory = new OperationResult();
                return resultHistory.$get();
            });
        }
    };
})

.controller('CalculateCtrl',  function ($scope, observeOnScope, $timeout, OperationResult, observableChains) {

    /**
     * Display the proper alert once an entry has been saved
     */
    $scope.alertTimeout = null;
    var updateSaveStatus = function (success) {
        if (success) {
            return function () {
                $scope.operation.saveStatus = true;
                    if ($scope.alertTimeout !== null) {
                        $timeout.cancel($scope.alertTimeout);
                    }
                    $scope.alertTimeout = $timeout(function () {
                        $scope.operation.saveStatus = null;
                    }, 1500
                );
            }
        } else {
            return function () {
                $scope.operation.saveStatus = false;
            }
        }
    }

    // Initialize scope variables
    $scope.operation    = {};

    // Create an observable from the scope variable named "operation.operand"
    var updatePartialObservable = observableChains.updatePartialObservableFrom($scope.$toObservable('operation.operand'));

    // Create a shared observable from function "saveResult" that is bound to the "Save" button
    var saveResultObservable = observableChains.saveResultObservableFrom($scope.$createObservableFunction('saveResult'))
    .share();

    // Create an observable that loads history once an entry has been saved
    var loadHistoryObservable = observableChains.loadHistoryObservableFrom(saveResultObservable);

    // Subscribe to observable stream
    updatePartialObservable.subscribe(function success(response) {

        // Replace HTML code with data content
        $scope.operation.resultPartial = response.data;
    }, function failure(data) {

        // Handle error
        console.log("Error loading partial:");
        console.log(data);
    });

    saveResultObservable.subscribe(
        updateSaveStatus(true),
        updateSaveStatus(false)
    );

    loadHistoryObservable.subscribe(function success(data) {
        console.log(data);
        if (angular.isDefined(data._embedded)) {
            $scope.history = data._embedded.calculateResults;
        }
    }, function failure(data) {
        console.log("Error loading history:");
        console.log(data);
    });

});

