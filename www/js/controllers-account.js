

// ACCOUNTS CONTROLLER
moneyleashapp.controller('AccountController', function ($scope, $rootScope, $state, $stateParams, $ionicModal, $ionicListDelegate, $ionicActionSheet, $firebaseArray, AccountsFactory, MembersFactory, dateFilter) {

    $scope.AccountTitle = '';
    $scope.inEditMode = false;
    $scope.uid = '';
    $scope.editIndex = '';
    $scope.temp = {
        'accountname': '',
        'startbalance': '',
        'dateopen': '',
        'datecreated': dateFilter(new Date(), 'MMMM dd, yyyy HH:mm:ss'),
        'dateupdated': dateFilter(new Date(), 'MMMM dd, yyyy HH:mm:ss'),
        'accounttype': ''
    }

    if ($stateParams.isNew == 'True') {
        // Create new account
        $scope.AccountTitle = "Create Account";
    } else {
        // Edit account
        var fbAuth = fb.getAuth();
        $scope.inEditMode = true;
        $scope.uid = fbAuth.uid;
        AccountsFactory.getThisAccount(fbAuth.uid, $stateParams.accountId).then(function (account) {
            var dtOpen = new Date(account.dateopen);
            var dtCreated = new Date(account.datecreated);
            var dtUpdated = new Date(account.dateupdated);

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
