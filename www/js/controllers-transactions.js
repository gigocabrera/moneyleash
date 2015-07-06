
// TRANSACTIONS CONTROLLER
moneyleashapp.controller('TransactionsController', function ($scope, $state, $rootScope, $stateParams, $ionicPopover, $ionicListDelegate, $ionicActionSheet, AccountsFactory, PickTransactionTypeService, PickTransactionCategoryService, PickTransactionAmountService, PickTransactionDateService, PickTransactionPayeeService, dateFilter) {

    $scope.transactions = [];
    $scope.AccountTitle = $stateParams.accountName;
    $scope.inEditMode = false;
    $scope.editIndex = 0;
    //$scope.SortingIsEnabled = false;

    //// SORT
    //$scope.reorderBtnText = '';
    //$scope.showSorting = function (isEnabled) {
    //    $scope.SortingIsEnabled = !isEnabled;
    //    $scope.reorderBtnText = ($scope.SortingIsEnabled ? 'Done' : '');
    //    $scope.popover.hide();
    //};
    //$scope.moveItem = function (transaction, fromIndex, toIndex) {
    //    //$scope.transactions.splice(fromIndex, 1);
    //    //$scope.transactions.splice(toIndex, 0, transaction);
    //    console.log(fromIndex);
    //    console.log(toIndex);
    //    var dtTransDate = new Date(transaction.date);
    //    if (isNaN(dtTransDate)) {
    //        transaction.date = "";
    //    } else {
    //        // save date in ISO format in service
    //        dtTransDate = dtTransDate.toISOString();            
    //        // format date to be displayed
    //        //var format = 'MMMM dd, yyyy';
    //        console.log(dtTransDate);
    //    }
    //    console.log(transaction);
    //};

    //// POPOVER
    //$scope.animation = 'slide-in-up';
    //$ionicPopover.fromTemplateUrl('templates/popover.html', {
    //    scope: $scope,
    //    animation: $scope.animation
    //}).then(function (popover) {
    //    $scope.popover = popover;
    //});
    //$scope.replaceIcon = false;
    //$scope.openPopover = function ($event, replaceIt) {
    //    $scope.popover.show($event);
    //    // Hide after 5 seconds
    //    //$timeout(function () {
    //    //    $scope.popover.hide();
    //    //}, 5000);
    //};

    //// SHOW FILTERS - ACTION SHEET
    //$scope.showFilters = function () {
    //    $ionicActionSheet.show({
    //        buttons: [
    //          { text: 'Show All Transactions' },
    //          { text: 'Active Transactions' },
    //          { text: 'Cleared Transactions' }
    //        ],
    //        titleText: '<strong>FILTER</strong>',
    //        cancelText: 'Cancel',
    //        cancel: function () {
    //            // add cancel code..
    //        },
    //        buttonClicked: function (index) {
    //            //$scope.transactions = $filter('transactionsFilter')('active');
    //            return true;
    //        }
    //    });
    //};

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
        PickTransactionTypeService.typeSelected = '';
        PickTransactionCategoryService.categorySelected = '';
        PickTransactionCategoryService.categoryid = '';
        PickTransactionAmountService.amountSelected = '';
        PickTransactionDateService.dateSelected = '';
        PickTransactionPayeeService.payeeSelected = '';
        PickTransactionPayeeService.payeeid = '';
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
