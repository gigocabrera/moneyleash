
// ACCOUNTS CONTROLLER
moneyleashapp.controller('TransactionsController', function ($scope, $rootScope, $stateParams, $ionicModal, $ionicListDelegate, $ionicActionSheet, $firebaseArray, AccountsFactory) {

    $scope.transactions = [];
    $scope.AccountTitle = $stateParams.accountName;
    $scope.inEditMode = false;
    $scope.editIndex = 0;
    $scope.UserEmail = '';

    // SORT
    $scope.SortingIsEnabled = false;
    $scope.reorderBtnText = '';
    $scope.enableSorting = function (isEnabled) {
        $scope.SortingIsEnabled = !isEnabled;
        $scope.reorderBtnText = ($scope.SortingIsEnabled ? 'Done' : '');
    };
    $scope.moveItem = function (transaction, fromIndex, toIndex) {
        //$scope.transactions.splice(fromIndex, 1);
        //$scope.transactions.splice(toIndex, 0, transaction);
        //console.log(fromIndex);
        //console.log(toIndex);
    };

    // SWIPE
    $scope.listCanSwipe = true;
    $scope.handleSwipeAndTap = function ($event, transaction) {
        $event.stopPropagation();
        var options = $event.currentTarget.querySelector('.item-options');
        if (!options.classList.contains('invisible')) {
            $ionicListDelegate.closeOptionButtons();
        } else {
            $ionicListDelegate.closeOptionButtons();
            $scope.inEditMode = true;
            $scope.editIndex = transaction.$id;
            $scope.currentItem = transaction;
            var dtTransaction = new Date(transaction.date);
            if (isNaN(dtTransaction)) {
                dtTransaction = "";
            }
            $scope.currentItem.date = dtTransaction;
            $scope.myTitle = "Edit " + $scope.currentItem.payee;
            $scope.modal.show();
        }
    };

    // OPEN ACCOUNT SAVE MODAL 
    $ionicModal.fromTemplateUrl('templates/transaction.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.modal = modal
    })
    $scope.openEntryForm = function (action) {
        $scope.myTitle = action + " Transaction";
        $scope.currentItem = {
            accountid: $stateParams.accountId,
            type: "",
            payee: "",
            category: "",
            amount: "",
            date: "",
            notes: "",
            photo: ""
        };
        $scope.modal.show();
    }

    // LIST
    $scope.list = function () {
        $rootScope.show("syncing");
        fbAuth = fb.getAuth();
        var ref = fb.child("members").child(fbAuth.uid).child("accounts").child($stateParams.accountId).child("transactions");
        $scope.transactions = $firebaseArray(ref);
        var runningBal = 0;
        $scope.transactions.$loaded().then(function () {
            angular.forEach($scope.transactions, function (transaction) {
                if (transaction.type == "income") {
                    if (!isNaN(transaction.amount)) {
                        runningBal = runningBal + parseFloat(transaction.amount);
                    }
                } else {   
                    runningBal = runningBal - parseFloat(transaction.amount);
                }
                transaction.runningbal = runningBal.toFixed(2);
            })
        });
        $rootScope.hide();
    }

    // COPY
    $scope.copyTransaction = function (transaction) {
        //$ionicListDelegate.closeOptionButtons();
        //$scope.inEditMode = true;
        //$scope.editIndex = transaction.$id;
        //$scope.currentItem = transaction;
        //$scope.myTitle = "Edit " + $scope.currentItem.payee;
        //$scope.modal.show();
    };

    // SAVE
    $scope.SaveTransaction = function (currentItem) {
        if ($scope.inEditMode) {
            // edit 
            var dtDate = new Date($scope.currentItem.date);
            dtDate = +dtDate;
            $scope.currentItem.date = dtDate;
            $scope.transactions.$save(currentItem)
            $scope.inEditMode = false;
        } else {
            // new 
            $scope.temp = {
                accountid: $stateParams.accountId,
                type: $scope.currentItem.type,
                payee: $scope.currentItem.payee,
                category: $scope.currentItem.category,
                amount: $scope.currentItem.amount,
                date: $scope.currentItem.date.getTime(),
                notes: $scope.currentItem.notes,
                photo: $scope.currentItem.photo
            };
            fbAuth = fb.getAuth();
            var accountsref = AccountsFactory.ref(fbAuth.uid);
            var newtransactionref = accountsref.child($stateParams.accountId).child("transactions");
            var sync = $firebaseArray(newtransactionref);
            sync.$add($scope.temp).then(function (newChildRef) {
                $scope.temp = {
                    accountid: newChildRef.key()
                };
            });
        }
        $scope.currentItem = {};
        $scope.modal.hide();
    }

    // DELETE
    $scope.deleteItem = function (type, index) {
        // Show the action sheet
        var hideSheet = $ionicActionSheet.show({
            destructiveText: 'Delete Account',
            titleText: 'Are you sure you want to delete ' + type.AccountTypeName + '? This will permanently delete the account from the app.',
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
                $scope.accounttypes.accounttypes.splice(index, 1);
                return true;
            }
        });
    };
})
