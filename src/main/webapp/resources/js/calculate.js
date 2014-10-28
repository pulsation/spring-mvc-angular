angular.module('calculate', ['ui.bootstrap', 'ngSanitize', 'ngResource', 'rx', 'ngAnimate', 'ui.grid'])

.factory('OperationResult', ['$resource', function ($resource) {
    return $resource('/data/calculate-results/');
}])

.controller('CalculateCtrl',  function ($scope, $http, observeOnScope, $timeout, OperationResult) {

    $scope.operation = {};

    var httpSquarePartial = function (newVal) {
        return $http({
            method: 'POST',
            url: '/partials/square',
            data: { "x": newVal }
        });
    };

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
        console.log("Error loading partial:");
        console.log(data);
    });

    var saveResultObservable = $scope.$createObservableFunction('saveResult')
    .map(function (operand) {
        var result = new OperationResult();

        result.operation = operand + "^2";
        result.value = operand * operand;
        return result;
    })
    .flatMap(function (operationResult) {
        return operationResult.$save();
    }).share();

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
    });

    var loadHistoryObservable = saveResultObservable.startWith(null).flatMap(function () {
        var resultHistory = new OperationResult();
        return resultHistory.$get();
    });

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

