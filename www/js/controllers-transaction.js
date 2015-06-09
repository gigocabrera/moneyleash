
// ACCOUNTS CONTROLLER
moneyleashapp.controller('TransactionController', function ($scope, $state, $rootScope, $stateParams, $ionicModal, $ionicListDelegate, $ionicActionSheet, $firebaseArray, AccountsFactory) {
   
    $scope.transactions = [];
    $scope.AccountTitle = '';
    $scope.inEditMode = false;
    $scope.isTransfer = false;
    $scope.uid = '';
    $scope.editIndex = '';
    $scope.currentItem = {
        'accountFrom': '',
        'accountTo': '',
        'amount': '',
        'category': '',
        'date': '',
        'iscleared': false,
        'isrecurring': false,
        'istransfer': false,
        'notes': '',
        'payee': '',
        'photo': '',
        'runningbalance': '',
        'type': ''
    };

    // TRANSACTION TYPES
    $scope.transactionTypeList = [
        { text: "Income", value: "income" },
        { text: "Expense", value: "expense" },
        { text: "Transfer", value: "transfer" },
    ];
    $scope.updateTransactionType = function (item) {
        $scope.isTransfer = (item.text.toUpperCase() == "TRANSFER") ? true : false;
    }

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
        // update
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
            // create
            if (isNaN($scope.currentItem.notes)) {
                $scope.currentItem.notes = "";
            }
            if (isNaN($scope.currentItem.photo)) {
                $scope.currentItem.photo = "";
            }
            $scope.currentItem.type = $scope.currentItem.type.toLowerCase();
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