
// ACCOUNTS CONTROLLER
moneyleashapp.controller('AccountsController', function ($scope, $rootScope, $state, $ionicModal, $ionicListDelegate, $ionicActionSheet, $firebaseArray, AccountsFactory, MembersFactory) {

    $scope.accounts = [];
    $scope.inEditMode = false;
    $scope.editIndex = 0;
    $scope.uid = '';

    // SORT
    $scope.SortingIsEnabled = false;
    $scope.reorderBtnText = '';
    $scope.enableSorting = function (isEnabled) {
        $scope.SortingIsEnabled = !isEnabled;
        $scope.reorderBtnText = ($scope.SortingIsEnabled ? 'Done' : '');
    };
    $scope.moveItem = function (account, fromIndex, toIndex) {
        //$scope.accounts.splice(fromIndex, 1);
        //$scope.accounts.splice(toIndex, 0, account);

        //$scope.localaccounts = [];
        //for (var i = 0; i < $scope.accounts.length; i++) {
        //    var obj = {
        //        name: $scope.posts[i].name,
        //        body: $scope.posts[i].body
        //    };
        //    localPosts.push(obj);
        //}
        //var ref = AccountsFactory.getAccounts($scope.uid);
        //fb.set($scope.accounts);
        //console.log($scope.accounts);
    };

    // SWIPE
    $scope.listCanSwipe = true;
    $scope.handleSwipeOptions = function ($event, account) {
        $event.stopPropagation();
        var options = $event.currentTarget.querySelector('.item-options');
        if (!options.classList.contains('invisible')) {
            $ionicListDelegate.closeOptionButtons();
        } else {
            $state.go('app.transactions', { accountId: account.$id, accountName: account.accountname });
        }
    };

    // CREATE
    $scope.createAccount = function (title) {
        $scope.myTitle = title + " Create Account";
        $state.go('app.account', { isNew: 'True', accountId: '-1' });
    }

    // LIST
    $scope.list = function () {
        $rootScope.show("syncing");
        fbAuth = fb.getAuth();
        $scope.uid = fbAuth.uid
        $scope.accounts = AccountsFactory.getAccounts($scope.uid);
        $rootScope.hide();
    }

    // EDIT
    $scope.editAccount = function (account) {
        $state.go('app.account', { isNew: 'False', accountId: account.$id });
    };

    // DELETE
    $scope.deleteAccount = function (account) {
        var hideSheet = $ionicActionSheet.show({
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
                $scope.accounts.$remove(account).then(function (newChildRef) {
                    newChildRef.key() === account.$id;
                })
                return true;
            }
        });
    };
})
