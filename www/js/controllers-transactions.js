
// ACCOUNTS CONTROLLER
moneyleashapp.controller('TransactionsController', function ($scope, $state, $rootScope, $ionicPopover, $stateParams, $ionicModal, $ionicListDelegate, $ionicActionSheet, AccountsFactory) {

    $scope.transactions = [];
    $scope.AccountTitle = $stateParams.accountName;
    $scope.inEditMode = false;
    $scope.editIndex = 0;
    $scope.UserEmail = '';

    // SORT
    $scope.SortingIsEnabled = false;
    $scope.reorderBtnText = '';
    $scope.enableSorting = function (isEnabled) {
        $scope.SortingIsEnabled = !isEnabled;
        $scope.reorderBtnText = ($scope.SortingIsEnabled ? 'Done' : '');
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
        $scope.setPlatform();
        $scope.popover.show($event);
    };
    $scope.closePopover = function () {
        $scope.popover.hide();
    };
    $scope.setPlatform = function () {
        document.body.classList.remove('platform-ios');
        document.body.classList.add('platform-android');
    }

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
        $state.go('app.transaction', { accountId: $stateParams.accountId, accountName:$stateParams.accountName, transactionId: '-1', transactionName: '' });
    }

    // EDIT
    $scope.editTransaction = function ($event, transaction) {
        $state.go('app.transaction', { accountId: $stateParams.accountId, accountName: $stateParams.accountName, transactionId: transaction.$id, transactionName: transaction.payee });
    };

    // LIST
    $scope.list = function () {
        $rootScope.show("syncing");
        $scope.transactions = AccountsFactory.getTransactions($stateParams.accountId);
        //UpdateRunningBalance($scope.transactions);
        $rootScope.hide();
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
            if (transaction.type == "income") {
                if (!isNaN(transaction.amount)) {
                    runningBal = runningBal + parseFloat(transaction.amount);
                }
            } else {
                runningBal = runningBal - parseFloat(transaction.amount);
            }
            transaction.runningbal = runningBal.toFixed(2);
        })
        $scope.totalCount = total;
        $scope.clearedCount = cleared;
        $scope.pendingCount = total - cleared;
    }, true);

    // COPY
    $scope.copyTransaction = function (transaction) {
        //$ionicListDelegate.closeOptionButtons();
        //$scope.inEditMode = true;
        //$scope.editIndex = transaction.$id;
        //$scope.currentItem = transaction;
        //$scope.myTitle = "Edit " + $scope.currentItem.payee;
        //$scope.modal.show();
    };

    // DELETE
    $scope.deleteTransaction = function (accounttype, index) {
        // Show the action sheet
        var hideSheet = $ionicActionSheet.show({
            destructiveText: 'Delete Account',
            titleText: 'Are you sure you want to delete ' + accounttype.name + '? This will permanently delete the account from the app.',
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
                $scope.accounttypes.accounttypes.splice(index, 1);
                return true;
            }
        });
    };

    // MORE OPTIONS
    $scope.showMoreOptionsSwipe = function () {
        
    };

    // TRANSACTION CLEARED
    $scope.toggleCompleted = function (transaction) {
        $scope.transactions.$save(transaction.$id);
    };
})

//function UpdateRunningBalance(trans) {
//    var runningBal = 0;
//    trans.$loaded().then(function () {
//        angular.forEach(trans, function (transaction) {
//            if (transaction.type == "income") {
//                if (!isNaN(transaction.amount)) {
//                    runningBal = runningBal + parseFloat(transaction.amount);
//                }
//            } else {
//                runningBal = runningBal - parseFloat(transaction.amount);
//            }
//            transaction.runningbal = runningBal.toFixed(2);
//        })
//    });
//}