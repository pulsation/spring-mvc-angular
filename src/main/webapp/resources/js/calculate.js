console.log("Javascript correctly included");

angular.module('calculate', ['ui.bootstrap', 'ngSanitize', 'rx', 'ngCookies'])

.controller('CalculateCtrl',  function ($scope, $http, observeOnScope, $compile) {
    console.log("Entered controller");

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
    var obs1 =
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

    // Subscribe to observer stream
    obs1.subscribe(function success(response) {
        // Replace HTML code with data content
        $scope.operation.resultPartial = response.data;
    }, function failure(data) {
        // Handle error
        console.log("Error reading data:");
        console.log(data);
    });

    var obs2 = $scope.$createObservableFunction('save')
    .map(function (operand) {
        return { operation: operand + "^2", value: operand * operand };
    })
    .flatMap(function (operationResult) {
        return httpSaveResult(operationResult.operation, operationResult.value );
    });

    obs2.subscribe(function success(response) {
        $scope.operation.saveStatus = true;
    }, function failure(data) {
        $scope.operation.saveStatus = false;
        console.log("Error saving data:");
        console.log(data);
    });

});

