angular.module('calculate', ['ui.bootstrap', 'ngSanitize', 'ngResource', 'rx', 'ngAnimate', 'ui.grid', 'ui.grid.hateoas'])

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

/**
 * Load result partial
 */
.factory('loadPartialObservable', function (httpSquarePartial) {

    return function (numberChangedObservable) {

        return numberChangedObservable

             // Throttle stream in order to avoid too much ajax requests
             .throttle(300)

             // Take async requests in the right order
             .flatMapLatest(function(operand) {
                 return (httpSquarePartial(operand.newValue));
             });

    };
})

/**
 * Save result entry
 */
.factory('saveResultObservable', function (OperationResult) {

    return function (clickSaveObservable) {

        return clickSaveObservable

        // Map operand to something writable
        .map(function (operand) {

            var result = new OperationResult();

            result.operation = operand + "^2";
            result.value     = operand * operand;

            return result;
        })

        .flatMap(function (operationResult) {
            return operationResult.$save();
        });
    };
})

/**
 * Load history
 */

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

/**
 * Display the proper alert once an entry has been saved
*/
.controller('AlertCtrl', function ($scope, $timeout) {

    $scope.alertTimeout = null;
    $scope.saveStatus   = undefined;

    $scope.$on('resultSaved', function () {
        $scope.saveStatus = true;
        if ($scope.alertTimeout !== null) {
            $timeout.cancel($scope.alertTimeout);
        }
        $scope.alertTimeout = $timeout(function () {
            $scope.saveStatus = null;
        }, 1500);
    });

    $scope.$on('resultSaveFailed', function () {
        $scope.saveStatus = false;
    });
})

/**
 * Calculation controller
 */
.controller('CalculateCtrl', function ($scope, $timeout, loadPartialObservable, saveResultObservable, $rootScope) {

    $scope.operation = {};

    // Subscribe to an observable created from the scope variable named "operation.operand"
    loadPartialObservable($scope.$toObservable('operation.operand'))
    .subscribe(function success(response) {

        // Replace HTML code with data content
        $scope.operation.resultPartial = response.data;

    }, function failure(data) {
        console.log("Error loading partial:");
        console.log(data);
    });

    // Display the correct alert message after the entry has been saved
    saveResultObservable($scope.$createObservableFunction('saveResult'))
    .subscribe(function () {
            $rootScope.$broadcast('resultSaved');
        }, function () {
            $rootScope.$broadcast('resultSaveFailed');
        }
    );
})

/**
 * History update controller
 */
.controller('HistoryCtrl',  function ($scope, observeOnScope, OperationResult, loadHistoryObservable) {

    $scope.gridOptions = {
        columnDefs: [
            {
                name: 'Operation',
                field: 'operation'
            },
            {
                name: 'Result',
                field: 'value'
            },
            {
                name: 'Created on',
                field: 'created',
                cellFilter: 'date:\'MM/dd/yyyy HH:MM:ss\''
            }
        ]
    }

    // Create an observable that loads history once an entry has been saved
    loadHistoryObservable($scope.$eventToObservable('resultSaved'))
    .subscribe(function success(data) {
        if (angular.isDefined(data._embedded)) {
            $scope.gridOptions.data = data._embedded.calculateResults;
        }
    }, function failure(data) {
        console.log("Error loading history:");
        console.log(data);
    });
});

