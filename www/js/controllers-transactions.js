
// TRANSACTIONS CONTROLLER
moneyleashapp.controller('TransactionsController', function ($scope, $state, $rootScope, $stateParams, $ionicPopover, $ionicListDelegate, $ionicActionSheet, AccountsFactory, PickTransactionServices, dateFilter, $ionicFilterBar) {

    $scope.transactions = [];
    $scope.AccountTitle = $stateParams.accountName;
    $scope.inEditMode = false;
    $scope.editIndex = 0;
    $scope.SortingIsEnabled = false;

    // SORT
    $scope.reorderBtnText = '';
    $scope.showSorting = function (isEnabled) {
        $scope.SortingIsEnabled = !isEnabled;
        $scope.reorderBtnText = ($scope.SortingIsEnabled ? 'Done' : '');
        //$scope.popover.hide();
    };
    
    $scope.moveItem = function (transaction, fromIndex, toIndex) {
        //$scope.transactions.splice(fromIndex, 1);
        //$scope.transactions.splice(toIndex, 0, transaction);

        console.log(transaction);
        //console.log(fromIndex);
        //console.log(toIndex);
    };

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

    // SHOW FILTERS - ACTION SHEET
    $scope.moreOptions = function () {
        $ionicActionSheet.show({
            buttons: [
              { text: 'Show All Transactions' },
              { text: 'Active Transactions' },
              { text: 'Cleared Transactions' }
            ],
            titleText: '<strong>FILTER</strong>',
            cancelText: 'Cancel',
            cancel: function () {
                // add cancel code..
                $ionicListDelegate.closeOptionButtons();
            },
            buttonClicked: function (index) {
                //$scope.transactions = $filter('transactionsFilter')('active');
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
    $scope.createTransaction = function (title) {
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
        $state.go('app.transaction', { accountId: $stateParams.accountId, transactionId: '' });
    }

    // GET TRANSACTIONS
    $scope.groups = [];
    $scope.list = function () {
        //
        $scope.transactions = AccountsFactory.getTransactionsByDate($stateParams.accountId);
        //$scope.transactions.$loaded().then(function () {
        //    //
        //    var transaction = {};
        //    var currentDate = '';
        //    var todaysDate = new Date();
        //    var previousDay = '';
        //    var previousYear = '';
        //    var groupValue = '';
        //    var todayFlag = false;
        //    var group = {};
        //    var format = 'MMMM dd, yyyy';
        //    var total = 0;
        //    var cleared = 0;
        //    var runningBal = 0;
        //    var clearedBal = 0;
        //    //
        //    angular.forEach($scope.transactions, function (transaction) {
        //        //
        //        // Add grouping functionality for sticky affix elements
        //        // https://github.com/aliok/ion-affix
        //        //
        //        currentDate = new Date(transaction.date);
        //        if (!previousDay || currentDate.getDate() !== previousDay || currentDate.getFullYear() !== previousYear) {
        //            var dividerId = dateFilter(currentDate, format);
        //            if (dividerId !== groupValue) {
        //                groupValue = dividerId;
        //                var tday = dateFilter(todaysDate, format);
        //                //console.log("tday: " + tday + ", " + dividerId);
        //                if (tday === dividerId) {
        //                    todayFlag = true;
        //                } else {
        //                    todayFlag = false;
        //                }
        //                group = {
        //                    label: groupValue,
        //                    transactions: [],
        //                    isToday: todayFlag
        //                };
        //                $scope.groups.push(group);
        //                //console.log(group);
        //            }
        //        }
        //        group.transactions.push(transaction);
        //        previousDay = currentDate.getDate();
        //        previousYear = currentDate.getFullYear();
        //        //
        //        // Handle Running Balance
        //        //
        //        total++;
        //        transaction.ClearedClass = '';
        //        if (transaction.iscleared === true) {
        //            transaction.ClearedClass = 'transactionIsCleared';
        //            cleared++;
        //            if (transaction.type === "Income") {
        //                if (!isNaN(transaction.amount)) {
        //                    clearedBal = clearedBal + parseFloat(transaction.amount);
        //                }
        //            } else if (transaction.type === "Expense") {
        //                clearedBal = clearedBal - parseFloat(transaction.amount);
        //            }
        //            transaction.clearedBal = clearedBal.toFixed(2);
        //        }
        //        if (transaction.type === "Income") {
        //            if (!isNaN(transaction.amount)) {
        //                runningBal = runningBal + parseFloat(transaction.amount);
        //            }
        //        } else if (transaction.type === "Expense") {
        //            runningBal = runningBal - parseFloat(transaction.amount);
        //        }
        //        transaction.runningbal = runningBal.toFixed(2);
        //    })
        //    $scope.totalCount = total;
        //    $scope.clearedCount = cleared;
        //    $scope.pendingCount = total - cleared;
        //    $scope.currentBalance = runningBal.toFixed(2);
        //    $scope.clearedBalance = clearedBal.toFixed(2);

        //    // We want to update account totals
        //    AccountsFactory.getAccount($stateParams.accountId).then(function (account) {
        //        $scope.temp = account;
        //        $scope.temp.balancetoday = runningBal.toFixed(2);
        //        $scope.temp.balancecurrent = runningBal.toFixed(2);
        //        $scope.temp.balancecleared = clearedBal.toFixed(2);
        //        AccountsFactory.updateAccount($stateParams.accountId, $scope.temp);
        //    });
        //})
    };

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
        //
        // Update transaction under category
        //
        var onComplete = function (error) {
            if (error) {
                console.log('Synchronization failed');
            }
        };
        var categoryTransactionRef = AccountsFactory.getTransactionByCategoryRef(transaction.categoryid, transaction.$id);
        var categoryTransaction = {
            payee: transaction.payee,
            amount: transaction.amount,
            date: transaction.date,
            type: transaction.type,
            iscleared: transaction.iscleared
        };
        categoryTransactionRef.update(categoryTransaction, onComplete);
        //
        // Update transaction under payee
        //
        var payeeTransactionRef = AccountsFactory.getTransactionByPayeeRef(transaction.payeeid, transaction.$id);
        var payeeTransaction = {
            payee: transaction.payee,
            amount: transaction.amount,
            date: transaction.date,
            type: transaction.type,
            iscleared: transaction.iscleared
        };
        payeeTransactionRef.update(payeeTransaction, onComplete);
    };

    //
    // SEARCH TRANSACTIONS
    // https://github.com/djett41/ionic-filter-bar
    //
    var filterBarInstance;
    $scope.showFilterBar = function () {
        filterBarInstance = $ionicFilterBar.show({
            items: $scope.transactions,
            update: function (filteredItems) {
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
                //
                // Delete transaction under category
                //
                var categoryTransactionRef = AccountsFactory.getTransactionByCategoryRef(transaction.categoryid, transaction.$id);
                categoryTransactionRef.remove();
                //
                // Delete transaction under payee
                //
                var payeeTransactionRef = AccountsFactory.getTransactionByPayeeRef(transaction.payeeid, transaction.$id);
                payeeTransactionRef.remove();
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
