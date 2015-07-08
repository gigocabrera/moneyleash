
// TRANSACTIONS CONTROLLER
moneyleashapp.controller('TransactionsController', function ($scope, $state, $rootScope, $stateParams, $ionicPopover, $ionicListDelegate, $ionicActionSheet, AccountsFactory, PickTransactionServices, dateFilter) {

    $scope.transactions = [];
    $scope.AccountTitle = $stateParams.accountName;
    $scope.inEditMode = false;
    $scope.editIndex = 0;

    // SWIPE
    $scope.listCanSwipe = true;
    $scope.handleSwipeAndTap = function ($event, transaction) {
        $event.stopPropagation();
        var options = $event.currentTarget.querySelector('.item-options');
        if (!options.classList.contains('invisible')) {
            $ionicListDelegate.closeOptionButtons();
        } else {
            // TODO: Add filter by payee option
        }
    };

    // CREATE
    $scope.createTransaction = function (title) {
        PickTransactionServices.typeSelected = '';
        PickTransactionServices.categorySelected = '';
        PickTransactionServices.categoryid = '';
        PickTransactionServices.amountSelected = '';
        PickTransactionServices.dateSelected = '';
        PickTransactionServices.payeeSelected = '';
        PickTransactionServices.payeeid = '';
        PickTransactionServices.accountFromSelected = '';
        PickTransactionServices.accountFromId = '';
        PickTransactionServices.accountToSelected = '';
        PickTransactionServices.accountToId = '';
        $state.go('app.transaction', { accountId: $stateParams.accountId, transactionId: '' });
    }

    // EDIT
    $scope.editTransaction = function (transaction) {
        $ionicListDelegate.closeOptionButtons();
        $state.go('app.transaction', { accountId: $stateParams.accountId, accountName: $stateParams.accountName, transactionId: transaction.$id, transactionName: transaction.payee });
    };

    // GET TRANSACTIONS
    $scope.list = function () {
        $scope.transactions = AccountsFactory.getTransactionsByDate($stateParams.accountId);
    };

    // DELETE
    $scope.deleteTransaction = function (transaction) {
        // Show the action sheet
        $ionicActionSheet.show({
            destructiveText: 'Delete Account',
            titleText: 'Are you sure you want to delete ' + transaction.payee + '? This will permanently delete the account from the app.',
            cancelText: 'Cancel',
            cancel: function () {
                // add cancel code..
            },
            buttonClicked: function (index) {
                //Called when one of the non-destructive buttons is clicked,
                //with the index of the button that was clicked and the button object.
                //Return true to close the action sheet, or false to keep it opened.
                return true;
            },
            destructiveButtonClicked: function () {
                //Called when the destructive button is clicked.
                //Return true to close the action sheet, or false to keep it opened.
                $ionicListDelegate.closeOptionButtons();
                $scope.transactions.$remove(transaction).then(function (newChildRef) {
                    newChildRef.key() === transaction.$id;
                })
                return true;
            }
        });
    };

    // WATCH
    $scope.$watch('transactions', function () {
        //
        var total = 0;
        var cleared = 0;
        var runningBal = 0;
        var clearedBal = 0;
        var todayBal = 0;
        //
        angular.forEach($scope.transactions, function (transaction) {
            //
            // Handle Running Balance
            //
            total++;
            if (transaction.iscleared === true) {
                cleared++;
                if (transaction.type === "Income") {
                    if (!isNaN(transaction.amount)) {
                        clearedBal = clearedBal + parseFloat(transaction.amount);
                    }
                } else if (transaction.type === "Expense") {
                    clearedBal = clearedBal - parseFloat(transaction.amount);
                }
                transaction.clearedBal = clearedBal.toFixed(2);
            }
            if (transaction.type === "Income") {
                if (!isNaN(transaction.amount)) {
                    runningBal = runningBal + parseFloat(transaction.amount);
                }
            } else if (transaction.type === "Expense") {
                runningBal = runningBal - parseFloat(transaction.amount);
            }
            transaction.runningbal = runningBal.toFixed(2);
        })
        $scope.totalCount = total;
        $scope.clearedCount = cleared;
        $scope.pendingCount = total - cleared;
        $scope.currentBalance = runningBal.toFixed(2);
        $scope.clearedBalance = clearedBal.toFixed(2);

        // We want to update account totals
        AccountsFactory.getAccount($stateParams.accountId).then(function (account) {
            $scope.temp = account;
            $scope.temp.balancetoday = runningBal.toFixed(2);
            $scope.temp.balancecurrent = runningBal.toFixed(2);
            $scope.temp.balancecleared = clearedBal.toFixed(2);
            AccountsFactory.updateAccount($stateParams.accountId, $scope.temp);
        });
    }, true);

})
