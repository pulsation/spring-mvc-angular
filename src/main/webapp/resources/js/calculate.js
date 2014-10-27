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

/*
    var httpSaveResult = function (operation, value) {
        return $http({
            method: 'POST',
            url: '',
            data: {
                "operation" : operation,
                "value"     : value
            }
        });
    }
*/
    var httpLoadHistory = function () {
        return $http({
            method: 'GET',
            url: '/data/calculate-results/'
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
        console.log("Error loading partial:");
        console.log(data);
    });

    var saveResultObservable = $scope.$createObservableFunction('saveResult');
    var clickSaveSubject = new Rx.Subject();
    saveResultObservable.subscribe(clickSaveSubject);

    var saveResultSubject = clickSaveSubject.map(function (operand) {
        var result = new OperationResult();

        result.operation = operand + "^2";
        result.value = operand * operand;
        return result;
    })
    .flatMap(function (operationResult) {
        console.log("SAVING");
        return operationResult.$save();
    });

    $scope.alertTimeout = null;
    saveResultSubject.subscribe(function success(response) {
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

    var loadHistoryObservable = saveResultSubject.startWith(1).flatMap(function () {
        return httpLoadHistory();
    });

    loadHistoryObservable.subscribe(function success(response) {
        console.log("Loading history.");
        if (angular.isDefined(response.data._embedded)) {
            $scope.history = response.data._embedded.calculateResults;
        }
    }, function failure(data) {
        console.log("Error loading history:");
        console.log(data);
    });

});

