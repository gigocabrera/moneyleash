
// TRANSACTIONS CONTROLLER
moneyleashapp.controller('TransactionsController', function ($scope, $state, $stateParams, $ionicListDelegate, $ionicActionSheet, $ionicPopover, AccountsFactory, PickTransactionServices, $ionicFilterBar) {

    $scope.transactions = [];
    $scope.AccountTitle = $stateParams.accountName;
    $scope.inEditMode = false;
    $scope.editIndex = 0;
    $scope.SortingIsEnabled = false;

    $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
        if (fromState.name === "app.transaction") {
            refresh($scope.transactions, $scope, AccountsFactory, $stateParams.accountId);
        }
    });

    // SHOW FILTERS - ACTION SHEET
    $scope.moreOptions = function () {
        $ionicActionSheet.show({
            buttons: [
              { text: 'Copy' },
              { text: 'Email' },
              { text: 'Print' }
            ],
            titleText: '<strong>OPTIONS</strong>',
            cancelText: 'Cancel',
            cancel: function () {
                $ionicListDelegate.closeOptionButtons();
            },
            buttonClicked: function (index) {
                $ionicListDelegate.closeOptionButtons();
                return true;
            }
        });
    };

    // SWIPE
    $scope.listCanSwipe = true;
    $scope.handleSwipeAndTap = function ($event, transaction) {
        $event.stopPropagation();
        var options = $event.currentTarget.querySelector('.item-options');
        if (!options.classList.contains('invisible')) {
            $ionicListDelegate.closeOptionButtons();
        } else {
            var target = event.srcElement;
            if (target.className.contains('toggleTransactionCleared')) {
            } else {
                $state.go('app.transaction', { accountId: $stateParams.accountId, accountName: $stateParams.accountName, transactionId: transaction.$id, transactionName: transaction.payee });
            }
        }
    };

    // CREATE
    $scope.createTransaction = function () {
        PickTransactionServices.typeDisplaySelected = '';
        PickTransactionServices.typeInternalSelected = '';
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
        PickTransactionServices.photoSelected = 'R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
        PickTransactionServices.noteSelected = '';
        $state.go('app.transaction', { accountId: $stateParams.accountId, transactionId: '' });
    }

    // GET TRANSACTIONS
    $scope.groups = [];
    $scope.transactions = AccountsFactory.getTransactionsByDate($stateParams.accountId);
    $scope.transactions.$loaded().then(function (x) {
        refresh($scope.transactions, $scope, AccountsFactory, $stateParams.accountId);
    }).catch(function (error) {
        console.error("Error:", error);
    });

    // SET TRANSACTION CLEAR
    $scope.clearTransaction = function (transaction) {
        //
        // Update Existing Transaction
        //
        if (transaction.iscleared) {
            transaction.ClearedClass = 'transactionIsCleared';
        } else {
            transaction.ClearedClass = '';
        }
        $scope.transactions.$save(transaction);

        ////
        //// Update transaction under category
        ////
        //var onComplete = function (error) {
        //    if (error) {
        //        //console.log('Synchronization failed');
        //    }
        //};
        //var categoryTransactionRef = AccountsFactory.getTransactionByCategoryRef(transaction.categoryid, transaction.$id);
        //var categoryTransaction = {
        //    payee: transaction.payee,
        //    amount: transaction.amount,
        //    date: transaction.date,
        //    type: transaction.type,
        //    iscleared: transaction.iscleared
        //};
        //categoryTransactionRef.update(categoryTransaction, onComplete);
        ////
        //// Update transaction under payee
        ////
        //var payeeTransactionRef = AccountsFactory.getTransactionByPayeeRef(transaction.payeeid, transaction.$id);
        //var payeeTransaction = {
        //    payee: transaction.payee,
        //    amount: transaction.amount,
        //    date: transaction.date,
        //    type: transaction.type,
        //    iscleared: transaction.iscleared
        //};
        //payeeTransactionRef.update(payeeTransaction, onComplete);


        //
        refresh($scope.transactions, $scope, AccountsFactory, $stateParams.accountId);
        //
    };

    //
    // SEARCH TRANSACTIONS
    // https://github.com/djett41/ionic-filter-bar
    //
    var filterBarInstance;
    $scope.showFilterBar = function () {
        filterBarInstance = $ionicFilterBar.show({
            items: $scope.transactions,
            update: function (filteredItems, filterText) {
                $scope.transactions = filteredItems;
            },
            filterProperties: 'payee'
        });
    };

    // DELETE
    $scope.deleteTransaction = function (transaction) {
        // Show the action sheet
        $ionicActionSheet.show({
            destructiveText: 'Delete Account',
            titleText: 'Are you sure you want to delete ' + transaction.payee + '? This will permanently delete the transaction from the account',
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

                ////
                //// Delete transaction under category
                ////
                //var categoryTransactionRef = AccountsFactory.getTransactionByCategoryRef(transaction.categoryid, transaction.$id);
                //categoryTransactionRef.remove();
                ////
                //// Delete transaction under payee
                ////
                //var payeeTransactionRef = AccountsFactory.getTransactionByPayeeRef(transaction.payeeid, transaction.$id);
                //payeeTransactionRef.remove();


                //
                // Delete transfer if applicable
                //
                if (transaction.istransfer) {
                    var otherAccountId = '';
                    if ($stateParams.accountId === transaction.accountToId) {
                        otherAccountId = transaction.accountFromId;
                    } else {
                        otherAccountId = transaction.accountToId;
                    }
                    var transferRef = AccountsFactory.getTransactionRef(otherAccountId, transaction.linkedtransactionid);
                    transferRef.remove();
                }
                //
                // Delete transaction
                //
                var alltransactions = AccountsFactory.deleteTransaction();
                alltransactions.$remove(transaction).then(function (ref) {
                    refresh($scope.transactions, $scope, AccountsFactory, $stateParams.accountId);
                });
                return true;
            }
        });
    };
})

function refresh(transactions, $scope, AccountsFactory, accountId) {
    //
    var currentDate = '';
    var todaysDate = new Date();
    var previousDay = '';
    var previousYear = '';
    var groupValue = '';
    var todayFlag = false;
    var group = {};
    var format = 'MMMM DD, YYYY';
    var total = 0;
    var cleared = 0;
    var runningBal = 0;
    var clearedBal = 0;
    var index;
    //
    for (index = 0; index < transactions.length; ++index) {
        //
        var transaction = transactions[index];
        //
        // Add grouping functionality for sticky affix elements
        // https://github.com/Poordeveloper/ion-sticky
        //
        currentDate = new Date(transaction.date);
        if (!previousDay || currentDate.getDate() !== previousDay || currentDate.getFullYear() !== previousYear) {
            var dividerId = moment(transaction.date).format(format);
            if (dividerId !== groupValue) {
                groupValue = dividerId;
                var tday = moment(todaysDate).format(format);
                //console.log("tday: " + tday + ", " + dividerId);
                if (tday === dividerId) {
                    todayFlag = true;
                } else {
                    todayFlag = false;
                }
                group = {
                    label: groupValue,
                    transactions: [],
                    isToday: todayFlag
                };
                $scope.groups.push(group);
                //console.log(group);
            }
        }
        group.transactions.push(transaction);
        previousDay = currentDate.getDate();
        previousYear = currentDate.getFullYear();
        //
        // Handle Running Balance
        //
        total++;
        transaction.ClearedClass = '';
        if (transaction.iscleared === true) {
            transaction.ClearedClass = 'transactionIsCleared';
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
        //
    }
    $scope.totalCount = total;
    $scope.clearedCount = cleared;
    $scope.pendingCount = total - cleared;
    $scope.currentBalance = runningBal.toFixed(2);
    $scope.clearedBalance = clearedBal.toFixed(2);

    // We want to update account totals
    var account = AccountsFactory.getAccount(accountId);
    $scope.temp = account;
    $scope.temp.balancetoday = runningBal.toFixed(2);
    $scope.temp.balancecurrent = runningBal.toFixed(2);
    $scope.temp.balancecleared = clearedBal.toFixed(2);
    AccountsFactory.saveAccount($scope.temp);
}