
// ACCOUNTS CONTROLLER
moneyleashapp.controller('AccountsController', function ($scope, $state, $ionicListDelegate, $ionicActionSheet, AccountsFactory) {

    $scope.accounts = [];
    $scope.networth = '';
    $scope.inEditMode = false;
    $scope.editIndex = 0;
    $scope.uid = '';

    // SWIPE
    $scope.listCanSwipe = true;
    $scope.handleSwipeOptions = function ($event, account) {
        $event.stopPropagation();
        var options = $event.currentTarget.querySelector('.item-options');
        if (!options.classList.contains('invisible')) {
            $ionicListDelegate.closeOptionButtons();
        } else {
            $state.go('app.transactionsByDay', { accountId: account.$id, accountName: account.accountname });
        }
    };

    // CREATE ACCOUNT
    $scope.createAccount = function (title) {
        $state.go('app.account', { accountId: '-1', isNew: 'True' });
    }

    //// LIST
    //$scope.list = function () {
    //    $scope.accounts = AccountsFactory.getAccounts();
    //}
    $scope.accounts = AccountsFactory.getAccounts();

    // EDIT
    $scope.editAccount = function (account) {
        $ionicListDelegate.closeOptionButtons();
        $state.go('app.account', { isNew: 'False', accountId: account.$id });
    };

    // DELETE
    $scope.deleteAccount = function (account) {
        $ionicActionSheet.show({
            destructiveText: 'Delete Account',
            titleText: 'Are you sure you want to delete ' + account.accountname + '? This will permanently delete the account from the app.',
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
                var transactionid = account.transactionid;
                var accountid = account.$id;
                $scope.accounts.$remove(account).then(function (newChildRef) {
                    AccountsFactory.deleteTransaction(accountid, transactionid);
                })
                return true;
            }
        });
    };
})
