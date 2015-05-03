

moneyleashapp.controller("AccountTypesController", ["$scope", "AccountTypes",
    function ($scope, AccountTypes, $rootScope, $state, $ionicModal, $ionicListDelegate, $ionicActionSheet) {
        
        $scope.items = {};
        $scope.inEditMode = false;
        $scope.editIndex = 0;

        // SORT
        $scope.SortingIsEnabled = false;
        $scope.reorderBtnText = '';
        $scope.enableSorting = function (isEnabled) {
            $scope.SortingIsEnabled = !isEnabled;
            $scope.reorderBtnText = ($scope.SortingIsEnabled ? 'Done' : '');
        };
        $scope.moveItem = function (item, fromIndex, toIndex) {
            $scope.items.splice(fromIndex, 1);
            $scope.items.splice(toIndex, 0, item);
        };

        // SWIPE
        $scope.listCanSwipe = true;

        $scope.closeSwipe = function ($event) {
            $event.stopPropagation();
            var options = $event.currentTarget.querySelector('.item-options');
            if (!options.classList.contains('invisible')) {
                $ionicListDelegate.closeOptionButtons();
            } else {
                $state.go('account');
            }
        };

        // OPEN ACCOUNT TYPE MODAL 
        $ionicModal.fromTemplateUrl('templates/accounttypesave.html', {
                    scope: $scope,
                    animation: 'slide-in-up'
                    }).then(function (modal) {
            $scope.modal = modal
        })

        $scope.openAccountSave = function(title) {
            $scope.myTitle = title + " Account Type";
            $scope.item = {
                typename: "",
                icon: "",
                created: Date.now(),
                updated: Date.now()
                };
            $scope.modal.show();
        }

        // GET ACCOUNT TYPES
        fbAuth = fb.getAuth();
        if (fbAuth) {
            AccountTypes(escapeEmailAddress(fbAuth.password.email)).$bindTo($scope, "items");
        }
    }
])


// ACCOUNT TYPES CONTROLLER
moneyleashapp.controller('AccountTypesController444', function ($scope, $rootScope, $state, $ionicModal, $ionicListDelegate, $ionicActionSheet, AccountsData, $firebaseObject) {

    $scope.items = {};
    $scope.inEditMode = false;
    $scope.editIndex = 0;

    // SORT
    $scope.SortingIsEnabled = false;
    $scope.reorderBtnText = '';
    $scope.enableSorting = function (isEnabled) {
        $scope.SortingIsEnabled = !isEnabled;
        $scope.reorderBtnText = ($scope.SortingIsEnabled ? 'Done' : '');
    };
    $scope.moveItem = function (item, fromIndex, toIndex) {
        //console.log($scope.items);
        $scope.items.splice(fromIndex, 1);
        $scope.items.splice(toIndex, 0, item);
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
    $scope.editItem = function (index) {
        $rootScope.show('');
        $ionicListDelegate.closeOptionButtons();
        $scope.inEditMode = true;
        $scope.editIndex = index;
        $scope.currentAccount = {
            AccountName: "",
            StartBalance: "",
            StartDate: "",
            AccountType: ""
        };

        fbAuth = fb.getAuth();
        AccountsData.getAccountType(escapeEmailAddress(fbAuth.password.email)).then(function (accounttype) {
            $scope.accounttype = accounttype;
            $scope.myTitle = "Edit " + $scope.accounttype.Name;
        });
        $scope.modal.show();
        $rootScope.hide();
    };

    // LIST
    $scope.listItems = function ($scope, AccountTypes) {
        fbAuth = fb.getAuth();
        if (fbAuth) {
            var syncObject = $firebaseObject(fb.child("members/" + escapeEmailAddress(fbAuth.password.email) + "/accounttypes/"));
            syncObject.$bindTo($scope, "items");
        }
    };

    // SAVE
    $scope.SaveAccountType = function (account) {

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
            console.log("editIndex " + $scope.editIndex);

            AccountsData.updateAccount($scope.currentAccount, fbAuth.uid);

            //$scope.data.accounts[$scope.editIndex] = $scope.currentAccount;
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

    // OPEN ACCOUNT TYPE MODAL 
    $ionicModal.fromTemplateUrl('templates/accounttypesave.html', {
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