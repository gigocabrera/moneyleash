
// ACCOUNTS CONTROLLER
moneyleashapp.controller('TransactionsController', function ($scope, $rootScope, $state, $stateParams, $ionicModal, $ionicListDelegate, $ionicActionSheet, $firebaseArray, $firebaseObject) {

    $scope.transactions = [];
    $scope.AccountTitle = $stateParams.accountName;
    $scope.AccountId = $stateParams.accountId;
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
        //$scope.data.transactions.splice(fromIndex, 1);
        //$scope.data.transactions.splice(toIndex, 0, transaction);
        console.log(fromIndex);
        console.log(toIndex);
    };

    // SWIPE
    $scope.listCanSwipe = true;
    $scope.handleSwipeOptions = function ($event) {
        $event.stopPropagation();
        var options = $event.currentTarget.querySelector('.item-options');
        if (!options.classList.contains('invisible')) {
            $ionicListDelegate.closeOptionButtons();
        } else {
            //Nothing here yet
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
            accountid: "",
            types: "",
            payee: "",
            category: "",
            amount: "",
            date: "",
            time: "",
            Notes: "",
            photo: ""
        };
        $scope.modal.show();
    }

    // LIST
    $scope.list = function () {
        $rootScope.show("syncing");
        fbAuth = fb.getAuth();
        var ref = fb.child("/members/" + fbAuth.uid + "/accounts/" + $scope.AccountId + "/transactions/");
        $scope.transactions = $firebaseArray(ref);
        var runningBal = 0;
        $scope.transactions.$loaded().then(function () {
            angular.forEach($scope.transactions, function (transaction) {
                if (transaction.type == "income") {
                    runningBal = runningBal + transaction.amount;
                } else {
                    runningBal = runningBal - transaction.amount;
                }
                transaction.runningbal = runningBal;
            })
        });
        $rootScope.hide();
    }

    // EDIT
    $scope.editItem = function (index) {
        $ionicListDelegate.closeOptionButtons();
        $scope.inEditMode = true;
        $scope.editIndex = index;
        $scope.currentItem = $scope.data.transactions[index];
        $scope.myTitle = "Edit " + $scope.currentItem.payee;
        $scope.modal.show();
    };

    // SAVE
    $scope.SaveItem = function (currentItem) {
        if ($scope.inEditMode) {
            // edit item
            $scope.data.transactions[$scope.editIndex] = $scope.currentItem;
            $scope.inEditMode = false;
        } else {
            // new item
            if ($scope.data.hasOwnProperty("transactions") !== true) {
                $scope.data.transactions = [];
            }
            $scope.data.transactions.push({
                accountid: 0,
                type: $scope.currentItem.type,
                payee: $scope.currentItem.payee,
                category: $scope.currentItem.category,
                amount: $scope.currentItem.amount,
                date: new Date(),
                time: "0",
                Notes: $scope.currentItem.notes,
                photo: "0"
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
