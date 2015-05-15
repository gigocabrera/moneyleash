
// ACCOUNTS CONTROLLER
moneyleashapp.controller('AccountsController', function ($scope, $rootScope, $state, $ionicModal, $ionicListDelegate, $ionicActionSheet, $firebaseArray, AccountsFactory, MembersFactory, dateFilter) {

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
            $state.go('app.transactions', { accountId: account.$id, accountName: account.AccountName });
        }
    };

    // OPEN ACCOUNT SAVE MODAL 
    $ionicModal.fromTemplateUrl('templates/account.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.modal = modal
    })

    // SHOW MODAL
    $scope.openEntryForm = function (title) {
        $scope.myTitle = title + " Account";
        $scope.currentItem = {
            AccountName: "",
            StartBalance: "",
            DateOpen: "",
            DateCreated: dateFilter(new Date(), 'MMMM dd, yyyy HH:mm:ss'),
            DateUpdated: dateFilter(new Date(), 'MMMM dd, yyyy HH:mm:ss'),
            AccountType: ""
        };
        $scope.modal.show();
    }

    // HIDE-CLOSE MODAL
    $scope.closeModal = function (title) {
        $scope.modal.hide();
    }

    // OPEN ACCOUNT TYPES
    $scope.openAccountTypes = function () {
        $state.go('app.accounttypes');
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
        $ionicListDelegate.closeOptionButtons();
        $scope.inEditMode = true;
        $scope.editIndex = account.$id;
        var dtOpen = new Date(account.DateOpen);
        var dtCreated = new Date(account.DateCreated);
        var dtUpdated = new Date(account.DateUpdated);

        //evaluate for valid dates
        if (isNaN(dtOpen)) {
            dtOpen = "";
        }
        if (isNaN(dtCreated)) {
            dtCreated = new Date();
        }
        if (isNaN(dtUpdated)) {
            dtUpdated = new Date();
        }        
        $scope.currentItem = {
            'AccountName': account.AccountName,
            'StartBalance': account.StartBalance,
            'DateOpen': dtOpen,
            'DateCreated': dateFilter(dtCreated, 'MMMM dd, yyyy HH:mm:ss'),
            'DateUpdated': dateFilter(dtUpdated, 'MMMM dd, yyyy HH:mm:ss'),
            'AccountType': account.AccountType
        }        
        $scope.myTitle = "Edit " + $scope.currentItem.AccountName;
        $scope.modal.show();
    };

    $scope.saveAccount = function (currentItem) {

        $rootScope.show('Creating...');

        if ($scope.inEditMode) {
            /* EDIT DATA */
            var dtOpen = new Date($scope.currentItem.DateOpen);
            var dtCreated = new Date($scope.currentItem.DateCreated);
            var dtUpdated = new Date();
            dtOpen = +dtOpen;
            dtCreated = +dtCreated;
            dtUpdated = +dtUpdated;
            $scope.currentItem.DateOpen = dtOpen;
            $scope.currentItem.DateCreated = dtCreated;
            $scope.currentItem.DateUpdated = dtUpdated;

            /* PREPARE DATA FOR FIREBASE*/
            var account = $scope.accounts.$getRecord($scope.editIndex);
            account.AccountName = $scope.currentItem.AccountName;
            account.StartBalance = $scope.currentItem.StartBalance;
            account.DateOpen = $scope.currentItem.DateOpen;
            account.DateCreated = $scope.currentItem.DateCreated;
            account.DateUpdated = $scope.currentItem.DateUpdated;
            account.AccountType = $scope.currentItem.AccountType;
            $scope.accounts.$save(account);

            $scope.inEditMode = false;

        } else {

            /* PREPARE DATA FOR FIREBASE*/
            $scope.temp = {
                AccountName: $scope.currentItem.AccountName,
                StartBalance: $scope.currentItem.StartBalance,
                DateOpen: $scope.currentItem.DateOpen.getTime(),
                DateCreated: $scope.currentItem.DateCreated,
                DateUpdated: $scope.currentItem.DateUpdated,
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
                $scope.accounts.$remove(account).then(function (newChildRef) {
                    newChildRef.key() === account.$id;
                })
                return true;
            }
        });
    };
})
