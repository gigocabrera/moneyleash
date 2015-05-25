/// <reference path="controllers-accounttypes.js" />


// ACCOUNTS CONTROLLER
moneyleashapp.controller('AccountController', function ($scope, $rootScope, $state, $stateParams, $ionicModal, $ionicListDelegate, $ionicActionSheet, $firebaseArray, AccountsFactory, MembersFactory, dateFilter) {

    $scope.accounts = '';
    $scope.AccountTitle = '';
    $scope.inEditMode = false;
    $scope.uid = '';
    $scope.editIndex = '';
    $scope.currentItem = {
        'accountname': '',
        'startbalance': '',
        'dateopen': '',
        'datecreated': dateFilter(new Date(), 'MMMM dd, yyyy HH:mm:ss'),
        'dateupdated': dateFilter(new Date(), 'MMMM dd, yyyy HH:mm:ss'),
        'accounttype': ''
    }

    // EDIT / CREATE ACCOUNT
    if ($stateParams.isNew == 'True') {
        $scope.AccountTitle = "Create Account";
    } else {
        // Edit account
        $scope.editIndex = $stateParams.accountId;
        var fbAuth = fb.getAuth();
        $scope.inEditMode = true;
        $scope.uid = fbAuth.uid;
        AccountsFactory.getAccount(fbAuth.uid, $scope.editIndex).then(function (account) {
            var dtOpen = new Date(account.dateopen);
            var dtCreated = new Date(account.datecreated);
            var dtUpdated = new Date(account.dateupdated);
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
                'accountname': account.accountname,
                'startbalance': account.startbalance,
                'dateopen': dtOpen,
                'datecreated': dateFilter(dtCreated, 'MMMM dd, yyyy HH:mm:ss'),
                'dateupdated': dateFilter(dtUpdated, 'MMMM dd, yyyy HH:mm:ss'),
                'accounttype': account.accounttype
            }
        });
        $scope.AccountTitle = "Edit Account";
    }
    
    // OPEN ACCOUNT TYPES
    $scope.openAccountTypes = function () {
        $state.go('app.selectaccounttype');
    }

    $scope.saveAccount = function (currentItem) {
        $rootScope.show('Creating...');
        if ($scope.inEditMode) {
            $scope.uid = fbAuth.uid
            var accountRef = fb.child("members").child($scope.uid).child("accounts").child($scope.editIndex);
            var onComplete = function (error) {
                if (error) {
                    console.log('Synchronization failed');
                } else {
                    //console.log('Synchronization succeeded');
                }
            };

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
            accountRef.update($scope.currentItem, onComplete);
            $scope.inEditMode = false;
        } else {
            /* PREPARE DATA FOR FIREBASE*/
            $scope.temp = {
                accountname: $scope.currentItem.accountname,
                startbalance: $scope.currentItem.startbalance,
                dateopen: $scope.currentItem.dateopen.getTime(),
                datecreated: $scope.currentItem.datecreated,
                dateupdated: $scope.currentItem.dateupdated,
                accounttype: $scope.currentItem.accounttype
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
        $state.go('app.accounts');
    }
})
