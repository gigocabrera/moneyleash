
// PICK TRANSACTION TYPE CONTROLLER
moneyleashapp.controller('PickAccountNameController', function ($scope, $state, $ionicHistory, PickAccountServices) {
    $scope.currentItem = { accountname: PickAccountServices.nameSelected };
    $scope.saveAccountName = function () {
        PickAccountServices.updateAccountName($scope.data.search);
        $ionicHistory.goBack();
    };
})

// PICK ACCOUNT AMOUNT CONTROLLER
moneyleashapp.controller('PickAccountAmountController', function ($scope, $ionicHistory, PickAccountServices) {

    $scope.clearValue = true;
    $scope.displayValue = 0;
    if (typeof PickAccountServices.amountSelected !== 'undenifed') {
        $scope.displayValue = PickAccountServices.amountSelected;
    }
    $scope.digitClicked = function (digit) {
        if (digit === 'C') {
            $scope.displayValue = '';
            $scope.clearValue = true;
        } else if (digit === '.') {
            $scope.displayValue = $scope.displayValue + digit;
        } else if (digit === 'B') {
            $scope.displayValue = $scope.displayValue.substring(0, $scope.displayValue.length - 1);
            $scope.clearValue = false;
        } else if (digit === 'D') {
            PickAccountServices.updateAmount($scope.displayValue);
            $ionicHistory.goBack();
        } else {
            if ($scope.clearValue) {
                $scope.displayValue = digit;
                $scope.clearValue = false;
            } else {
                $scope.displayValue = $scope.displayValue + digit;
            }
        }
    };
})

// PICK ACCOUNT DATE CONTROLLER
moneyleashapp.controller('PickAccountDateController', function ($scope, $ionicHistory, PickAccountServices, dateFilter) {
    if (typeof PickAccountServices.dateSelected !== 'undefined' && PickAccountServices.dateSelected !== '') {
        // format date to be used by pickadate directive
        var format = 'yyyy-MM-dd';
        $scope.myDate = dateFilter(PickAccountServices.dateSelected, format);
    }
    $scope.dateChanged = function (transDate) {
        PickAccountServices.updateDate(transDate);
        $ionicHistory.goBack();
    };
})

// PICK ACCOUNT TYPE CONTROLLER
moneyleashapp.controller('PickAccountTypeController', function ($scope, $state, $ionicHistory, PickAccountServices, AccountsFactory) {
    //
    // Get Account Types
    //
    $scope.List = AccountsFactory.getAccountTypes();
    $scope.List.$loaded().then(function () { });
    $scope.currentItem = { accounttype: PickAccountServices.typeSelected };
    $scope.itemchanged = function (accounttype) {
        PickAccountServices.updateType(accounttype.name);
        $ionicHistory.goBack();
    };
})

// ACCOUNTS CONTROLLER
moneyleashapp.controller('AccountController', function ($scope, $state, $stateParams, $ionicModal, $ionicActionSheet, AccountsFactory, PickAccountServices, dateFilter) {

    $scope.hideValidationMessage = true;
    $scope.InitialTransactionId = '';
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
        //$scope.currentItem.accountname = PickAccountServices.nameSelected;
        $scope.currentItem.accounttype = PickAccountServices.typeSelected;
        if (typeof PickAccountServices.dateSelected !== 'undefined' && PickAccountServices.dateSelected !== '') {
            // format date to be displayed
            var format = 'MMMM dd, yyyy';
            $scope.currentItem.dateopen = dateFilter(PickAccountServices.dateSelected, format);
        }
    });

    //// SHOW ACCOUNT TYPE MODAL
    //$ionicModal.fromTemplateUrl('templates/accounttypeselect.html', function (modal) {
    //    $scope.modalCtrl = modal;
    //}, {
    //    scope: $scope,
    //    animation: 'slide-in-up',
    //    focusFirstInput: true
    //});

    //// OPEN ACCOUNT TYPES
    //$scope.openModal = function () {
    //    $scope.modalCtrl.show();
    //}

    // GET ACCOUNT TYPES
    //$scope.accountTypeList = AccountsFactory.getAccountTypes();
    //$scope.accounttypes = AccountsFactory.getAccountTypes();

    // EDIT / CREATE ACCOUNT
    if ($stateParams.isNew === 'True') {
        $scope.AccountTitle = "Create Account";
    } else {
        // Edit account
        $scope.inEditMode = true;
        AccountsFactory.getAccount($stateParams.accountId).then(function (account) {
            var dtOpen = new Date(account.dateopen);
            if (isNaN(dtOpen)) {
                account.dateopen = "";
            } else {
                account.dateopen = dtOpen;
            }
            $scope.currentItem = account;
            // format date to be displayed
            var format = 'MMMM dd, yyyy';
            $scope.currentItem.dateopen = dateFilter($scope.currentItem.dateopen, format);
            $scope.InitialTransactionId = account.transactionid;
        });
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
        if (typeof $scope.currentItem.dateopen === 'undefined' || $scope.currentItem.dateopen === '') {
            $scope.hideValidationMessage = false;
            $scope.validationMessage = "Enter date when this account was opened"
            return;
        }
        if (typeof $scope.currentItem.accounttype === 'undefined' || $scope.currentItem.accounttype === '') {
            $scope.hideValidationMessage = false;
            $scope.validationMessage = "Select an account type"
            return;
        }

        if ($scope.inEditMode) {
            $scope.currentItem.transactionid = $scope.InitialTransactionId;
            AccountsFactory.updateAccount($stateParams.accountId, $scope.currentItem);
            $scope.inEditMode = false;
        } else {

            // Format date
            var dtTran = new Date($scope.currentItem.dateopen);
            dtTran = +dtTran;
            $scope.currentItem.dateopen = dtTran;

            /* SAVE NEW ACCOUNT */
            $scope.currentItem.balancecleared = '0';
            $scope.currentItem.balancetoday = '0';
            AccountsFactory.createNewAccount($scope.currentItem);
        }
        $scope.currentItem = {};
        $state.go('app.accounts');
    }
})
