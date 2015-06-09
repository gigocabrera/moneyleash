
// ACCOUNTS CONTROLLER
moneyleashapp.controller('TransactionsController', function ($scope, $state, $rootScope, $ionicPopover, $stateParams, $ionicModal, $ionicListDelegate, $ionicActionSheet, $timeout, AccountsFactory) {

    $scope.transactions = [];
    $scope.AccountTitle = $stateParams.accountName;
    $scope.inEditMode = false;
    $scope.editIndex = 0;
    $scope.SortingIsEnabled = false;

    // SORT
    $scope.reorderBtnText = '';
    $scope.showSorting = function (isEnabled) {
        $scope.SortingIsEnabled = !isEnabled;
        $scope.popover.hide();
    };
    $scope.moveItem = function (transaction, fromIndex, toIndex) {
        //$scope.transactions.splice(fromIndex, 1);
        //$scope.transactions.splice(toIndex, 0, transaction);
        //console.log(fromIndex);
        //console.log(toIndex);
    };

    // POPOVER
    $scope.animation = 'slide-in-up';
    $ionicPopover.fromTemplateUrl('templates/popover.html', {
        scope: $scope,
        animation: $scope.animation
    }).then(function (popover) {
        $scope.popover = popover;
    });
    $scope.replaceIcon = false;
    $scope.openPopover = function ($event, replaceIt) {
        $scope.popover.show($event);
        // Hide after 5 seconds
        //$timeout(function () {
        //    $scope.popover.hide();
        //}, 5000);
    };

    // SHOW FILTERS - ACTION SHEET
    $scope.showFilters = function () {
        $scope.popover.hide();
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
            // ToDo: Add filter by payee option
        }
    };

    // CREATE
    $scope.createTransaction = function (title) {
        $state.go('app.transaction', { accountId: $stateParams.accountId, transactionId: '' });
    }

    // EDIT
    $scope.editTransaction = function ($event, transaction) {
        $state.go('app.transaction', { accountId: $stateParams.accountId, accountName: $stateParams.accountName, transactionId: transaction.$id, transactionName: transaction.payee });
    };

    // LIST
    $scope.list = function () {
        $scope.groups = [];
        $scope.transactions = AccountsFactory.getTransactionsByDate($stateParams.accountId);

        // Add grouping functionality for sticky affix elements
        // https://github.com/aliok/ion-affix
        $scope.transactions.$loaded().then(function () {
            var dividers = [];
            var transaction = {};
            var currentDate = '';
            var previousDay = '';
            var previousYear = '';
            var output = [];
            var groupValue = '';
            var group = {};
            angular.forEach($scope.transactions, function (transaction) {
                currentDate = moment(transaction.date);
                if (!previousDay || currentDate.day() != previousDay || currentDate.year() != previousYear) {
                    var dividerId = currentDate.format('dddd MMMM D, YYYY');
                    if (dividerId !== groupValue) {
                        groupValue = dividerId;
                        group = {
                            label: groupValue,
                            transactions: []
                        };
                        $scope.groups.push(group);
                    }
                }
                group.transactions.push(transaction);
                previousDay = currentDate.day();
                previousYear = currentDate.year();
            })
        })
    }

    // WATCH
    $scope.$watch('transactions', function () {
        var total = 0;
        var cleared = 0;
        var runningBal = 0;
        angular.forEach($scope.transactions, function (transaction) {
            total++;
            if (transaction.iscleared === true) {
                cleared++;
            }
            if (transaction.type.toUpperCase() == "INCOME") {
                if (!isNaN(transaction.amount)) {
                    runningBal = runningBal + parseFloat(transaction.amount);
                }
            } else if (transaction.type.toUpperCase() == "EXPENSE") {
                runningBal = runningBal - parseFloat(transaction.amount);
            }
            transaction.runningbal = runningBal.toFixed(2);
        })
        $scope.totalCount = total;
        $scope.clearedCount = cleared;
        $scope.pendingCount = total - cleared;
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


})
