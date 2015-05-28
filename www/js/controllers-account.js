
// ACCOUNTS CONTROLLER
moneyleashapp.controller('AccountController', function ($scope, $rootScope, $state, $stateParams, $ionicModal, $ionicActionSheet, AccountsFactory, dateFilter) {

    $scope.accounts = '';
    $scope.AccountTitle = '';
    $scope.inEditMode = false;
    $scope.editIndex = '';
    $scope.currentItem = {
        'accountname': '',
        'startbalance': '',
        'dateopen': '',
        'accounttype': ''
    }

    // EDIT / CREATE ACCOUNT
    if ($stateParams.isNew == 'True') {
        $scope.AccountTitle = "Create Account";
    } else {
        // Edit account
        $scope.editIndex = $stateParams.accountId;
        $scope.inEditMode = true;
        AccountsFactory.getAccount($scope.editIndex).then(function (account) {
            var dtOpen = new Date(account.dateopen);
            if (isNaN(dtOpen)) {
                dtOpen = "";
            }
            $scope.currentItem = {
                'accountname': account.accountname,
                'startbalance': account.startbalance,
                'dateopen': dtOpen,
                'accounttype': account.accounttype
            }
        });
        $scope.AccountTitle = "Edit Account";
    }

    // OPEN ACCOUNT SAVE MODAL
    $scope.accounttypes = AccountsFactory.getAccountTypes();
    $scope.modalData = {"msg": 'Jan'};
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

    $scope.saveAccount = function (currentItem) {
        $rootScope.show('Creating...');
        if ($scope.inEditMode) {
            var accountRef = AccountsFactory.getAccountRef($scope.editIndex);
            var onComplete = function (error) {
                if (error) {
                    console.log('Synchronization failed');
                } else {
                    //console.log('Synchronization succeeded');
                }
            };

            /* EDIT DATA */
            var dtOpen = new Date($scope.currentItem.dateopen);
            dtOpen = +dtOpen;
            $scope.currentItem.dateopen = dtOpen;
            accountRef.update($scope.currentItem, onComplete);
            $scope.inEditMode = false;
        } else {
            /* PREPARE DATA FOR FIREBASE*/
            $scope.temp = {
                accountname: $scope.currentItem.accountname,
                startbalance: $scope.currentItem.startbalance,
                dateopen: $scope.currentItem.dateopen.getTime(),
                accounttype: $scope.currentItem.accounttype
            }

            /* SAVE DATA */
            var sync = AccountsFactory.getAccounts();
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
