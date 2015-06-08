
// ACCOUNTS CONTROLLER
moneyleashapp.controller('TransactionController', function ($scope, $state, $rootScope, $stateParams, $ionicModal, $ionicListDelegate, $ionicActionSheet, $firebaseArray, AccountsFactory) {
   
    $scope.transactions = [];
    $scope.AccountTitle = '';
    $scope.inEditMode = false;
    $scope.uid = '';
    $scope.editIndex = '';
    $scope.currentItem = {
        'amount': '',
        'category': '',
        'date': '',
        'iscleared': false,
        'isrecurring': false,
        'notes': '',
        'payee': '',
        'photo': '',
        'runningbalance': '',
        'type': ''
    };

    // LOAD ACCOUNT TYPES
    $scope.transactiontypes = [{ name: "income", id: "1" }, { name: "expense", id: "2" }, { name: "transfer", id: "3" }]

    // EDIT / CREATE ACCOUNT    
    if ($stateParams.transactionId == '') {
        $scope.TransactionTitle = "Create Transaction";
    } else {   
        // Edit transaction
        $scope.editIndex = $stateParams.transactionId;
        $scope.inEditMode = true;
        AccountsFactory.getTransaction($stateParams.accountId, $stateParams.transactionId).then(function (transaction) {
            var dtTransDate = new Date(transaction.date);
            if (isNaN(dtTransDate)) {
                dtTransDate = "";
            }
            $scope.currentItem = transaction;
        });
        $scope.TransactionTitle = "Edit Transaction";
    }

    // SAVE
    $scope.saveTransaction = function (currentItem) {

        var dtTran = new Date($scope.currentItem.date);
        dtTran = +dtTran;
        $scope.currentItem.date = dtTran;

        if ($scope.inEditMode) {
            var transactionRef = AccountsFactory.getTransactionRef($stateParams.accountId, $stateParams.transactionId);
            transactionRef.update($scope.currentItem, onComplete);
            var onComplete = function (error) {
                if (error) {
                    console.log('Synchronization failed');
                }
            };
            $scope.inEditMode = false;
        } else {
            // new 
            if (isNaN($scope.currentItem.notes)) {
                $scope.currentItem.notes = "";
            }
            if (isNaN($scope.currentItem.photo)) {
                $scope.currentItem.photo = "";
            }
            var sync = AccountsFactory.getTransactions($stateParams.accountId);
            sync.$add($scope.currentItem).then(function (newChildRef) {
                $scope.currentItem = {
                    accountid: newChildRef.key()
                };
            });
        }
        $rootScope.hide();
        $scope.currentItem = {};
        $state.go('app.transactionsByDay', { accountId: $stateParams.accountId, accountName: $stateParams.accountName });
    }
})