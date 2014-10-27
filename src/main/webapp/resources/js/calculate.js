angular.module('calculate', ['ui.bootstrap', 'ngSanitize', 'rx', 'ngAnimate', 'ui.grid'])

.controller('CalculateCtrl',  function ($scope, $http, observeOnScope, $timeout) {

    $scope.operation = {};

    var httpSquarePartial = function (newVal) {
        return $http({
            method: 'POST',
            url: '/partials/square',
            data: { "x": newVal }
        });
    };

    var httpSaveResult = function (operation, value) {
        return $http({
            method: 'POST',
            url: '/data/calculate-results/',
            data: {
                "operation" : operation,
                "value"     : value
            }
        });
    }

    // Create an observable
    var updatePartialObservable =
    // Watch scope variable named "operation.operand"
    $scope.$toObservable('operation.operand')
    // Throttle stream in order to avoid too much ajax requests
    .throttle(300)
    // Take async requests in the right order
    .flatMapLatest(function(operand) {
        return (httpSquarePartial(operand.newValue));
    })
    // Don't terminate stream on failure
//    .retry()
    ;

    // Subscribe to observable stream
    updatePartialObservable.subscribe(function success(response) {
        // Replace HTML code with data content
        $scope.operation.resultPartial = response.data;
    }, function failure(data) {
        // Handle error
        console.log("Error reading data:");
        console.log(data);
    });

    var saveResultObservable = $scope.$createObservableFunction('saveResult')
    .map(function (operand) {
        return { operation: operand + "^2", value: operand * operand };
    })
    .flatMap(function (operationResult) {
        return httpSaveResult(operationResult.operation, operationResult.value );
    });

    $scope.alertTimeout = null;
    saveResultObservable.subscribe(function success(response) {
        $scope.operation.saveStatus = true;
            if ($scope.alertTimeout !== null) {
                $timeout.cancel($scope.alertTimeout);
            }
            $scope.alertTimeout = $timeout(function () {
                $scope.operation.saveStatus = null;
            }, 1500);
        }, function failure(data) {
        $scope.operation.saveStatus = false;
        console.log("Error saving data:");
        console.log(data);
    });

    // Dummy data for ui-grid
    $scope.history = [
            {
                "Date": "2014-10-27",
                "Operation": "5^5",
                "Result": "25"
                }];

});

