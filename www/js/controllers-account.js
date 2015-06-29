
// ACCOUNTS CONTROLLER
moneyleashapp.controller('AccountController', function ($scope, $state, $stateParams, $ionicModal, $ionicActionSheet, AccountsFactory, dateFilter) {

    $scope.InitialTransactionId = '';
    $scope.AccountTitle = '';
    $scope.inEditMode = false;
    $scope.currentItem = {
        'accountname': '',
        'accounttype': '',
        'autoclear': 'false',
        'balancebegining': '',
        'balancecleared': '0',
        'balancetoday': '0',
        'dateopen': '',
        'transactionid': ''
    }

    // SHOW ACCOUNT TYPE MODAL
    $ionicModal.fromTemplateUrl('templates/accounttypeselect.html', function (modal) {
        $scope.modalCtrl = modal;
    }, {
        scope: $scope,
        animation: 'slide-in-up',
        focusFirstInput: true
    });

    // OPEN ACCOUNT TYPES
    $scope.openModal = function () {
        $scope.modalCtrl.show();
    }

    // GET ACCOUNT TYPES
    $scope.accountTypeList = AccountsFactory.getAccountTypes();

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
            $scope.InitialTransactionId = account.transactionid;
        });
        $scope.AccountTitle = "Edit Account";
    }

    // LOAD ACCOUNT TYPES
    $scope.accounttypes = AccountsFactory.getAccountTypes();

    // SAVE
    $scope.saveAccount = function (currentItem) {
        if ($scope.inEditMode) {
            $scope.currentItem.transactionid = $scope.InitialTransactionId;
            AccountsFactory.updateAccount($stateParams.accountId, $scope.currentItem);
            $scope.inEditMode = false;
        } else {

            /* SAVE NEW ACCOUNT */
            if ($scope.currentItem.autoclear) {
                $scope.currentItem.balancecleared = $scope.currentItem.balancebegining;
            } else {
                $scope.currentItem.balancecleared = '0';
            }
            $scope.currentItem.balancetoday = $scope.currentItem.balancebegining;
            $scope.currentItem.dateopen = $scope.currentItem.dateopen.getTime();
            AccountsFactory.createNewAccount($scope.currentItem);
        }
        $scope.currentItem = {};
        $state.go('app.accounts');
    }
})
