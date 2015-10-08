
// PAYEE TRANSACTIONS CONTROLLER
moneyleashapp.controller('PayeeTransactionsController', function ($scope, $stateParams, PayeesService) {
    $scope.transactionsbypayee = PayeesService.getTransactionsByPayee($stateParams.payeeid);
})

// PAYEE CONTROLLER
moneyleashapp.controller('PayeeController', function ($scope, $ionicHistory, $stateParams, PayeesService) {

    $scope.hideValidationMessage = true;
    $scope.inEditMode = false;
    $scope.currentItem = {
        'payeename': '',
        'payeesort': '',
        'lastcategory': '',
        'lastcategoryid': '',
        'lastamount': ''
    };

    // EDIT / CREATE PAYEE
    if ($stateParams.payeeid === '') {
        // create
        $scope.PayeeTitle = "Create Payee";
    } else {
        // edit
        $scope.inEditMode = true;
        PayeesService.getPayee($stateParams.payeeid).then(function (payee) {
            $scope.currentItem = payee;
        });
        $scope.PayeeTitle = "Edit Payee";
    }

    // SAVE
    $scope.savePayee = function () {

        // Validate form data
        if (typeof $scope.currentItem.payeename === 'undefined' || $scope.currentItem.payeename === '') {
            $scope.hideValidationMessage = false;
            $scope.validationMessage = "Please type a payee name"
            return;
        } else {
            $scope.currentItem.payeesort = $scope.currentItem.payeename.toUpperCase();
        }
        
        if ($scope.inEditMode) {
            // Update
            var onComplete = function (error) {
                if (error) {
                    //console.log('Synchronization failed');
                }
            };
            var payeeRef = PayeesService.getPayeeRef($stateParams.payeeid);
            payeeRef.update($scope.currentItem, onComplete);
            //
            // Update all transactions under this payee
            //
            var newname = $scope.currentItem.payeename;
            $scope.transactionsbypayee = PayeesService.getTransactionsByPayee($stateParams.payeeid);
            $scope.transactionsbypayee.$loaded().then(function () {
                angular.forEach($scope.transactionsbypayee, function (transaction) {
                    transaction.payee = newname;
                    $scope.transactionsbypayee.$save(transaction).then(function (ref) {
                        
                    });
                    //
                    // Update original transaction
                    //
                    // We're missing the account id in the membertransactionsbypayee node. Without this value we cannot update the 
                    // payee name on the original transaction. We can update the payee name on the transaction itself and it will
                    // update the payee name everywhere (workaround).
                    // 
                    //var transactionRef = AccountsFactory.getTransactionRef($stateParams.payeeid);
                    //transactionRef.update($scope.currentItem, onComplete);
                })
            })
            $scope.inEditMode = false;
        } else {
            // Create
            var sync = PayeesService.getPayees($scope.currentItem.categorytype);
            sync.$add($scope.currentItem).then(function (newChildRef) {
                $scope.currentItem = {
                    accountid: newChildRef.key()
                };
            });
        }
        $scope.currentItem = {};
        $ionicHistory.goBack();
    }

})

// PAYEES CONTROLLER
moneyleashapp.controller('PayeesController', function ($scope, $filter, $state, $ionicListDelegate, $ionicActionSheet, PayeesService) {
  
    // SWIPE
    $scope.listCanSwipe = true;
    $scope.handleSwipeOptions = function ($event, payee) {
        $event.stopPropagation();
        var options = $event.currentTarget.querySelector('.item-options');
        if (!options.classList.contains('invisible')) {
            $ionicListDelegate.closeOptionButtons();
        } else {
            $state.go('app.payee', { payeeid: payee.$id });
        }
    };

    $scope.$on('$ionicView.beforeEnter', function () {
        $scope.list();
    });

    // GET PAYEES
    $scope.payees = {};
    $scope.list = function () {
        $scope.payees = PayeesService.getPayees();
        $scope.payees.$loaded().then(function () { });
    };

    // SHOW FILTERS - ACTION SHEET
    $scope.moreOptions = function (payee) {
        $ionicActionSheet.show({
            buttons: [
              { text: 'Show Transactions' }
            ],
            titleText: '<strong>FILTER</strong>',
            cancelText: 'Cancel',
            cancel: function () {
                // add cancel code..
                $ionicListDelegate.closeOptionButtons();
            },
            buttonClicked: function (index) {
                $state.go('app.payeetransactions', { payeeid: payee.$id });
                $ionicListDelegate.closeOptionButtons();
                return true;
            }
        });
    };

    // DELETE
    $scope.deletePayee = function (payee) {
        $ionicActionSheet.show({
            destructiveText: 'Delete Payee',
            titleText: 'Are you sure you want to delete ' + payee.payeename + '? This will permanently delete the payee from the app.',
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
                //Return true to close the action sheet, or false to keep it opened
                var payeeRef = PayeesService.getPayeeRef(payee.$id);
                payeeRef.remove();
                return true;
            }
        });
    };

})