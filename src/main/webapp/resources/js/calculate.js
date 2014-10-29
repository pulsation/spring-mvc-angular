angular.module('calculate', ['ui.bootstrap', 'ngSanitize', 'ngResource', 'rx', 'ngAnimate', 'ui.grid'])

/**
 * REST resource for operation results
 */
.factory('OperationResult', ['$resource', function ($resource) {
    return $resource('/data/calculate-results/');
}])

/**
 * HTTP request that loads template partial
 */
.factory('httpSquarePartial', ['$http', function ($http) {
    return function (x) {
        return $http({
            method: 'POST',
            url: '/partials/square',
            data: { "x": x }
        })
    };
}])

.factory('calculateObservables', function (httpSquarePartial, OperationResult) {

    return function (numberChangedObservable, clickSaveObservable) {

        return {
            loadPartialObservable :
                numberChangedObservable

                 // Throttle stream in order to avoid too much ajax requests
                 .throttle(300)

                 // Take async requests in the right order
                 .flatMapLatest(function(operand) {
                     return (httpSquarePartial(operand.newValue));
                 }),


            saveResultObservable :
                clickSaveObservable

                // Map operand to something writable
                .map(function (operand) {
                    var result = new OperationResult();

                    result.operation = operand + "^2";
                    result.value = operand * operand;
                    return result;
                })

                .flatMap(function (operationResult) {
                    return operationResult.$save();
                })
        }

    };
})

.factory ('loadHistoryObservable', function (OperationResult) {
    return function (resultSavedObservable) {
        return resultSavedObservable

        // Load history as soon as the application is launched
        .startWith(null)

        .flatMap(function () {
            var resultHistory = new OperationResult();
            return resultHistory.$get();
        });

    };
})

.controller('CalculateCtrl', function ($scope, $timeout, calculateObservables, $rootScope) {
    // Initialize scope variables
    $scope.operation = {};

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

    // Subscribe to an observable created from the scope variable named "operation.operand"
    var ch = calculateObservables($scope.$toObservable('operation.operand'), $scope.$createObservableFunction('saveResult'));

    ch.loadPartialObservable
    .subscribe(function success(response) {

        // Replace HTML code with data content
        $scope.operation.resultPartial = response.data;

    }, function failure(data) {

        // Handle error
        console.log("Error loading partial:");
        console.log(data);
    });

    // Create a shared observable from function "saveResult" that is bound to the "Save" button
    var saveResultObservable = ch.saveResultObservable
    .share();

    // Display the correct alert message after the entry has been saved
    saveResultObservable.subscribe(
        function () {
            updateSaveStatus(true);
            $rootScope.$broadcast('SOME_TAG');
        },
        updateSaveStatus(false)
    );
})

.controller('HistoryCtrl',  function ($scope, observeOnScope, OperationResult, loadHistoryObservable) {



    // Create an observable that loads history once an entry has been saved
    loadHistoryObservable($scope.$eventToObservable('SOME_TAG'))
    .subscribe(function success(data) {
        if (angular.isDefined(data._embedded)) {
            $scope.history = data._embedded.calculateResults;
        }
    }, function failure(data) {
        console.log("Error loading history:");
        console.log(data);
    });
});

