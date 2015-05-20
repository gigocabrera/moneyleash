
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

    // CREATE NEW ACCOUNT
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
        //$ionicListDelegate.closeOptionButtons();
        //$scope.inEditMode = true;
        //$scope.editIndex = account.$id;
        //var dtOpen = new Date(account.dateopen);
        //var dtCreated = new Date(account.datecreated);
        //var dtUpdated = new Date(account.dateupdated);

        ////evaluate for valid dates
        //if (isNaN(dtOpen)) {
        //    dtOpen = "";
        //}
        //if (isNaN(dtCreated)) {
        //    dtCreated = new Date();
        //}
        //if (isNaN(dtUpdated)) {
        //    dtUpdated = new Date();
        //}        
        //$scope.currentItem = {
        //    'accountname': account.accountname,
        //    'startbalance': account.StartBalance,
        //    'dateopen': dtOpen,
        //    'datecreated': dateFilter(dtCreated, 'MMMM dd, yyyy HH:mm:ss'),
        //    'dateupdated': dateFilter(dtUpdated, 'MMMM dd, yyyy HH:mm:ss'),
        //    'AccountType': account.AccountType
        //}        
        //$scope.myTitle = "Edit " + $scope.currentItem.accountname;

        $state.go('app.account', { isNew: 'False', accountId: account.$id });
    };

    $scope.saveAccount = function (currentItem) {

        $rootScope.show('Creating...');

        if ($scope.inEditMode) {
            /* EDIT DATA */
            var dtOpen = new Date($scope.currentItem.dateopen);
            var dtCreated = new Date($scope.currentItem.datecreated);
            var dtUpdated = new Date();
            dtOpen = +dtOpen;
            dtCreated = +dtCreated;
            dtUpdated = +dtUpdated;
            $scope.currentItem.dateopen = dtOpen;
            $scope.currentItem.datecreated = dtCreated;
            $scope.currentItem.dateupdated = dtUpdated;

            /* PREPARE DATA FOR FIREBASE*/
            var account = $scope.accounts.$getRecord($scope.editIndex);
            account.accountname = $scope.currentItem.accountname;
            account.startbalance = $scope.currentItem.startbalance;
            account.dateopen = $scope.currentItem.dateopen;
            account.datecreated = $scope.currentItem.datecreated;
            account.dateupdated = $scope.currentItem.dateupdated;
            account.accounttype = $scope.currentItem.accounttype;
            $scope.accounts.$save(account);

            $scope.inEditMode = false;

        } else {

            /* PREPARE DATA FOR FIREBASE*/
            $scope.temp = {
                accountname: $scope.currentItem.accountname,
                startbalance: $scope.currentItem.startbalance,
                dateopen: $scope.currentItem.dateopen.getTime(),
                datecreated: $scope.currentItem.datecreated,
                dateupdated: $scope.currentItem.dateupdated,
                AccountType: $scope.currentItem.AccountType
            }

            /* SAVE DATA */
            fbAuth = fb.getAuth();
            var membersref = MembersFactory.ref();
            var newaccountref = membersref.child(fbAuth.uid).child("accounts");
            var sync = $firebaseArray(newaccountref);
            sync.$add($scope.temp).then(function (newChildRef) {
                $scope.temp = {
                    accountid: newChildRef.key()
                };
            });
        }
        $rootScope.hide();
        $scope.currentItem = {};
        $scope.modal.hide();
    }

    // DELETE
    $scope.deleteAccount = function (account) {
        // Show the action sheet
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
