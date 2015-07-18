
// PICK TRANSACTION TYPE CONTROLLER
moneyleashapp.controller('PayeeTransactionsController', function ($scope, $stateParams, PayeesService) {
    $scope.transactionsbypayee = PayeesService.getTransactionsByPayee($stateParams.payeeid);
})

// PAYEES CONTROLLER
moneyleashapp.controller('PayeesController', function ($scope, $filter, $state, $ionicListDelegate, $ionicActionSheet, PayeesService) {
  
    // Open payee transactions
    $scope.openPayeeTransactions = function (payee) {
        $state.go('app.payeetransactions', { payeeid: payee.$id });
    }

    $scope.$on('$ionicView.beforeEnter', function () {
        $scope.list();
    });

    // GET PAYEES
    $scope.list = function () {
        $scope.payees = PayeesService.getPayees();
        $scope.payees.$loaded().then(function () { });
    };
})