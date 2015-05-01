
// ACCOUNTS CONTROLLER
moneyleashapp.controller('AccountsController', function ($scope, $rootScope, $state, $ionicModal, $ionicListDelegate, $ionicActionSheet, $firebaseObject, AccountsData) {

    $scope.inEditMode = false;
    $scope.editingAccountIndex = 0;

    // SORT
    $scope.SortingIsEnabled = false;
    $scope.reorderBtnText = '';
    $scope.enableSorting = function (isEnabled) {
        console.log(isEnabled);
        $scope.SortingIsEnabled = !isEnabled;
        $scope.reorderBtnText = ($scope.SortingIsEnabled ? 'Done' : '');
        //button button-icon ion-ios-more
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

    // EDIT
    $scope.editAccount = function (index) {
        
        $rootScope.show('');
        $ionicListDelegate.closeOptionButtons();
        $scope.inEditMode = true;
        $scope.editingAccountIndex = index;
        $scope.currentAccount = {
            AccountName: "",
            StartBalance: "",
            StartDate: "",
            AccountType: ""
        };

        fbAuth = fb.getAuth();
        AccountsData.getAccount(fbAuth.uid, index).then(function (account) {
            $scope.currentAccount = account;
            $scope.myTitle = "Edit " + $scope.currentAccount.AccountName;
        });
        $scope.modal.show();
        $rootScope.hide();
    };

    // LIST
    $scope.list = function () {
        $rootScope.show('');
        fbAuth = fb.getAuth();
        if (fbAuth) {

            $rootScope.show('');
            AccountsData.getAccounts(fbAuth.uid).then(function (output) {
                $rootScope.hide();
                $scope.accounts = output;
                console.log("yomama " + output);
            });

            //var syncObject = $firebaseObject(fb.child("users/" + fbAuth.uid));
            //syncObject.$bindTo($scope, "data");
        }
        $rootScope.hide();
    }

    // SAVE
    $scope.SaveAccount = function (account) {

        /* Prepare Date */
        var temp = {
            year: $scope.currentAccount.StartDate.getFullYear(),
            month: $scope.currentAccount.StartDate.getMonth(),
            day: $scope.currentAccount.StartDate.getDate()
        };
        $scope.currentAccount.StartDate = temp.year + "-" + temp.month + "-" + temp.day

        if ($scope.inEditMode) {

            fbAuth = fb.getAuth();

            console.log("uid " + fbAuth.uid);
            console.log("currentAccount " + $scope.currentAccount.StartDate);
            console.log("editingAccountIndex " + $scope.editingAccountIndex);

            AccountsData.updateAccount($scope.currentAccount, fbAuth.uid);

            //$scope.data.accounts[$scope.editingAccountIndex] = $scope.currentAccount;
            $scope.inEditMode = false;
        } else {
            // save new account
            if ($scope.data.hasOwnProperty("accounts") !== true) {
                $scope.data.accounts = [];
            }
            $scope.data.accounts.push({
                'AccountName': $scope.currentAccount.AccountName,
                'StartBalance': $scope.currentAccount.StartBalance,
                'StartDate': $scope.currentAccount.StartDate,
                'AccountType': $scope.currentAccount.AccountType
            });
        }
        $scope.currentAccount = {};
        $scope.modal.hide();
    }

    // OPEN ACCOUNT SAVE MODAL 
    $ionicModal.fromTemplateUrl('templates/accountsave.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.modal = modal
    })

    $scope.openAccountSave = function (title) {
        $scope.myTitle = title + " Account";
        $scope.currentAccount = {
            AccountName: "",
            StartBalance: "",
            StartDate: "",
            AccountType: ""
        };
        $scope.modal.show();
    }

    // DELETE
    $scope.deleteAccount = function (account, index) {

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
