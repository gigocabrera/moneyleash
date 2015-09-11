
// PICK ACCOUNT BEGINNING DATE CONTROLLER
moneyleashapp.controller('PickAccountDateController', function ($scope, $ionicHistory, PickAccountServices) {
    if (typeof PickAccountServices.dateSelected !== 'undefined' && PickAccountServices.dateSelected !== '') {
        $scope.myDate = moment(PickAccountServices.dateSelected, 'MMMM D, YYYY').format('YYYY-MM-DD');
    }
    $scope.dateChanged = function (transDate) {
        transDate = moment(transDate, 'YYYY-MM-DD').format('MMMM D, YYYY');
        PickAccountServices.updateDate(transDate);
        $ionicHistory.goBack();
    };
})

// PICK ACCOUNT TYPE CONTROLLER
moneyleashapp.controller('PickAccountTypeController', function ($scope, $state, $ionicHistory, PickAccountServices, AccountsFactory) {
    $scope.List = AccountsFactory.getAccountTypes();
    $scope.List.$loaded().then(function () { });
    $scope.currentItem = { accounttype: PickAccountServices.typeSelected };
    $scope.itemchanged = function (accounttype) {
        PickAccountServices.updateType(accounttype.name);
        $ionicHistory.goBack();
    };
})

// ACCOUNT CONTROLLER
moneyleashapp.controller('AccountController', function ($scope, $state, $stateParams, $ionicModal, $ionicActionSheet, AccountsFactory, PickAccountServices) {

    $scope.hideValidationMessage = true;
    $scope.AccountTitle = '';
    $scope.inEditMode = false;
    $scope.currentItem = {
        'accountname': '',
        'accounttype': '',
        'autoclear': 'false',
        'balancecleared': '0',
        'balancetoday': '0',
        'dateopen': '',
        'transactionid': ''
    }

    $scope.$on('$ionicView.beforeEnter', function () {
        $scope.hideValidationMessage = true;
        $scope.currentItem.accounttype = PickAccountServices.typeSelected;
        // Handle transaction date
        if (typeof PickAccountServices.dateSelected !== 'undefined' && PickAccountServices.dateSelected !== '') {
            $scope.currentItem.dateopen = PickAccountServices.dateSelected;
        }
    });

    // EDIT / CREATE ACCOUNT
    if ($stateParams.isNew === 'True') {
        $scope.AccountTitle = "Create Account";
    } else {
        // Edit account
        $scope.inEditMode = true;
        var account = AccountsFactory.getAccount($stateParams.accountId);
        $scope.currentItem = account;
        $scope.currentItem.dateopen = moment(account.dateopen).format('MMMM D, YYYY');
        PickAccountServices.typeSelected = $scope.currentItem.accounttype;
        PickAccountServices.dateSelected = $scope.currentItem.dateopen;
        $scope.AccountTitle = "Edit Account";
    }

    // SAVE
    $scope.saveAccount = function (currentItem) {

        // Validate form data
        if (typeof $scope.currentItem.accountname === 'undefined' || $scope.currentItem.accountname === '') {
            $scope.hideValidationMessage = false;
            $scope.validationMessage = "Please enter a name for this account"
            return;
        }
        if (typeof $scope.currentItem.accounttype === 'undefined' || $scope.currentItem.accounttype === '') {
            $scope.hideValidationMessage = false;
            $scope.validationMessage = "Please select an account type"
            return;
        }

        // Format date
        var dtTran = moment(PickAccountServices.dateSelected, 'MMMM D, YYYY').valueOf();
        $scope.currentItem.dateopen = dtTran;

        if (typeof $scope.currentItem.dateopen === 'undefined' || $scope.currentItem.dateopen === '') {
            $scope.hideValidationMessage = false;
            $scope.validationMessage = "Please select a date for this account"
            return;
        }

        if ($scope.inEditMode) {
            //
            // Update Existing Account
            //
            var onComplete = function (error) {
                if (error) {
                    //console.log('Synchronization failed');
                }
            };
            AccountsFactory.saveAccount($scope.currentItem);
            $scope.inEditMode = false;
        } else {
            //
            // Create New Transaction
            //
            AccountsFactory.createNewAccount($scope.currentItem);
        }
        $scope.currentItem = {};
        $state.go('app.accounts');
    }
})
