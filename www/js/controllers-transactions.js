
// TRANSACTIONS CONTROLLER
moneyleashapp.controller('TransactionsController', function ($scope, $state, $rootScope, $stateParams, $ionicListDelegate, $ionicActionSheet, AccountsFactory, PickTransactionTypeService, PickTransactionCategoryService, PickTransactionAmountService, PickTransactionDateService, dateFilter) {

    $scope.transactions = [];
    $scope.AccountTitle = $stateParams.accountName;
    $scope.inEditMode = false;
    $scope.editIndex = 0;
    $scope.SortingIsEnabled = false;

    // SHOW FILTERS - ACTION SHEET
    $scope.showFilters = function () {
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
            },
            buttonClicked: function (index) {
                //$scope.transactions = $filter('transactionsFilter')('active');
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
            // TODO: Add filter by payee option
        }
    };

    // CREATE
    $scope.createTransaction = function (title) {
        PickTransactionTypeService.typeSelected = '';
        PickTransactionCategoryService.categorySelected = '';
        PickTransactionAmountService.amountSelected = '';
        PickTransactionDateService.dateSelected = '';
        $state.go('app.transaction', { accountId: $stateParams.accountId, transactionId: '' });
    }

    // EDIT
    $scope.editTransaction = function ($event, transaction) {
        $ionicListDelegate.closeOptionButtons();
        $state.go('app.transaction', { accountId: $stateParams.accountId, accountName: $stateParams.accountName, transactionId: transaction.$id, transactionName: transaction.payee });
    };

    // GET TRANSACTIONS
    var init = function () {
        
        $scope.groups = [];
        $scope.transactions = AccountsFactory.getTransactionsByDate($stateParams.accountId);

        // Add grouping functionality for sticky affix elements
        // https://github.com/aliok/ion-affix
        $scope.transactions.$loaded().then(function () {
            //
            var dividers = [];
            var transaction = {};
            var currentDate = '';
            var todaysDate = new Date();
            var previousDay = '';
            var previousYear = '';
            var output = [];
            var groupValue = '';
            var todayFlag = false;
            var group = {};
            var format = 'MMMM dd, yyyy';
            //
            angular.forEach($scope.transactions, function (transaction) {
                currentDate = new Date(transaction.date);
                if (!previousDay || currentDate.getDate() !== previousDay || currentDate.getFullYear() !== previousYear) {
                    var dividerId = dateFilter(currentDate, format);
                    if (dividerId !== groupValue) {
                        groupValue = dividerId;
                        var tday = dateFilter(todaysDate, format);
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
            })
        })
    };

    // WATCH
    $scope.$watch('transactions', function () {
        var total = 0;
        var cleared = 0;
        var runningBal = 0;
        var clearedBal = 0;
        angular.forEach($scope.transactions, function (transaction) {
            total++;
            if (transaction.iscleared === true) {
                cleared++;
                if (transaction.type.toUpperCase() === "INCOME") {
                    if (!isNaN(transaction.amount)) {
                        clearedBal = clearedBal + parseFloat(transaction.amount);
                    }
                } else if (transaction.type.toUpperCase() === "EXPENSE") {
                    clearedBal = clearedBal - parseFloat(transaction.amount);
                }
                transaction.clearedBal = clearedBal.toFixed(2);
            }
            if (transaction.type.toUpperCase() === "INCOME") {
                if (!isNaN(transaction.amount)) {
                    runningBal = runningBal + parseFloat(transaction.amount);
                }
            } else if (transaction.type.toUpperCase() === "EXPENSE") {
                runningBal = runningBal - parseFloat(transaction.amount);
            }
            transaction.runningbal = runningBal.toFixed(2);
        })
        $scope.totalCount = total;
        $scope.clearedCount = cleared;
        $scope.pendingCount = total - cleared;
        $scope.currentBalance = runningBal;
        $scope.clearedBalance = clearedBal;
    }, true);

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

    init();

})
