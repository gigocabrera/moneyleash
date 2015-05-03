
// ACCOUNTS CONTROLLER
moneyleashapp.controller('AccountsController', function ($scope, $rootScope, $state, $ionicModal, $ionicListDelegate, $ionicActionSheet, $firebaseObject) {

    $scope.inEditMode = false;
    $scope.editingAccountIndex = 0;
    $scope.currentAccount = {
        AccountName: "",
        StartBalance: "",
        OpenDate: "",
        AccountType: ""
    };

    // SORT
    $scope.SortingIsEnabled = false;
    $scope.reorderBtnText = '';
    $scope.enableSorting = function (isEnabled) {
        $scope.SortingIsEnabled = !isEnabled;
        $scope.reorderBtnText = ($scope.SortingIsEnabled ? 'Done' : '');
    };
    $scope.sortThisAccount = function (account, fromIndex, toIndex) {
        $scope.data.accounts.splice(fromIndex, 1);
        $scope.data.accounts.splice(toIndex, 0, account);
    };

    // SWIPE
    $scope.listCanSwipe = true;
    $scope.closeSwipeOptions = function ($event) {
        $event.stopPropagation();
        var options = $event.currentTarget.querySelector('.item-options');
        if (!options.classList.contains('invisible')) {
            $ionicListDelegate.closeOptionButtons();
        } else {
            $state.go('account');
        }
    };

    // OPEN ACCOUNT SAVE MODAL 
    $ionicModal.fromTemplateUrl('templates/accountsave.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.modal = modal
    })

    $scope.openAccountSave = function (title) {
        $scope.myTitle = title + " Account";
        $scope.modal.show();
    }

    // LIST
    $scope.list = function () {
        $rootScope.show('');
        fbAuth = fb.getAuth();
        if (fbAuth) {
            var syncObject = $firebaseObject(fb.child("users/" + fbAuth.uid));
            syncObject.$bindTo($scope, "data");
        }
        $rootScope.hide();
    }

    // EDIT
    $scope.editItem = function (index) {
        $ionicListDelegate.closeOptionButtons();
        $scope.inEditMode = true;
        $scope.editingAccountIndex = index;
        $scope.currentAccount = $scope.data.accounts[index];
        var displayDate = new Date($scope.currentAccount.OpenDate);
        $scope.currentAccount.OpenDate = displayDate;
        $scope.myTitle = "Edit " + $scope.currentAccount.AccountName;
        $scope.modal.show();
    };

    // SAVE
    $scope.SaveAccount = function (account) {
        var timestamp = new Date($scope.currentAccount.OpenDate).getTime();
        if ($scope.inEditMode) {
            // update account
            $scope.currentAccount.OpenDate = timestamp;
            $scope.data.accounts[$scope.editingAccountIndex] = $scope.currentAccount;
            $scope.currentContact = {};
            $scope.inEditMode = false;
        } else {
            // save new account
            if ($scope.data.hasOwnProperty("accounts") !== true) {
                $scope.data.accounts = [];
            }
            $scope.data.accounts.push({ 'AccountName': $scope.currentAccount.AccountName, 'StartBalance': $scope.currentAccount.StartBalance, 'OpenDate': timestamp, 'AccountType': $scope.currentAccount.AccountType });
        }
        $scope.currentAccount = {};
        $scope.modal.hide();
    }

    // DELETE
    $scope.deleteItem = function (account, index) {
        // Show the action sheet
        var hideSheet = $ionicActionSheet.show({
            destructiveText: 'Delete Account',
            titleText: 'Are you sure you want to delete ' + account.AccountName + '? This will permanently delete the account from the app.',
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
                $scope.data.accounts.splice(index, 1);
                return true;
            }
        });
    };
})
