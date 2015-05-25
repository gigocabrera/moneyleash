
// ACCOUNTS CONTROLLER
moneyleashapp.controller('TransactionsController', function ($scope, $state, $rootScope, $stateParams, $ionicModal, $ionicListDelegate, $ionicActionSheet, $firebaseArray, AccountsFactory) {

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

    // SWIPE
    $scope.listCanSwipe = true;
    $scope.handleSwipeAndTap = function ($event, transaction) {
        $event.stopPropagation();
        var options = $event.currentTarget.querySelector('.item-options');
        if (!options.classList.contains('invisible')) {
            $ionicListDelegate.closeOptionButtons();
        } else {
            // EDIT ACCOUNT
            $state.go('app.transaction', { accountId: $stateParams.accountId, accountName:$stateParams.accountName, transactionId: transaction.$id, transactionName: transaction.payee });
        }
    };

    // CREATE
    $scope.createTransaction = function (title) {
        $state.go('app.transaction', { accountId: $stateParams.accountId, accountName:$stateParams.accountName, transactionId: '-1', transactionName: '' });
    }

    // LIST
    $scope.list = function () {
        $rootScope.show("syncing");
        fbAuth = fb.getAuth();
        var ref = fb.child("members").child(fbAuth.uid).child("accounts").child($stateParams.accountId).child("transactions");
        $scope.transactions = $firebaseArray(ref);
        UpdateRunningBalance($scope.transactions);
        $rootScope.hide();
    }

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
    $scope.deleteItem = function (accounttype, index) {
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
})

function UpdateRunningBalance(trans) {
    var runningBal = 0;
    trans.$loaded().then(function () {
        angular.forEach(trans, function (transaction) {
            if (transaction.type == "income") {
                if (!isNaN(transaction.amount)) {
                    runningBal = runningBal + parseFloat(transaction.amount);
                }
            } else {
                runningBal = runningBal - parseFloat(transaction.amount);
            }
            transaction.runningbal = runningBal.toFixed(2);
        })
    });
}